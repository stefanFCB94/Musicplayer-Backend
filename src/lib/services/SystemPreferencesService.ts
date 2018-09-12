import { BaseConfigService } from '../base/BaseConfigService';

import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

import { ISystemPreferencesDAO } from '../interfaces/dao/ISystemPreferencesDAO';
import { IUUIDGenerator } from '../interfaces/services/IUUIDGenerator';
import { ILogger } from '../interfaces/services/ILogger';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';

import { InvalidConfigValueError } from '../error/config/InvalidConfigValueError';

import { SystemPreferences } from '../db/models/SystemPreferences';
import { SystemPreferencesConfiguration, SystemPreferencesConfigurations } from '../interfaces/models/SystemPreferencesConfiguration';
import { IConfigServiceProvider } from '../interfaces/services/IConfigService';


/**
 * @class
 * @public
 * 
 * Service to handle system preferences.
 * 
 * The service uses the data access object to do typical CRUD operations
 * against the database. All system preferences, which are take care of
 * by this service are stored in the database and no data will be cached.
 * 
 * The service uses a config, to check preference values and to cache
 * the preference values to optimize performace and to reduce database
 * interactions.
 * 
 * @extends BaseService
 */


@injectable()
export class SystemPreferencesService extends BaseConfigService implements ISystemPreferencesService {

  private preferenceDAO: ISystemPreferencesDAO;
  private uuidGenerator: IUUIDGenerator;

  private config: SystemPreferencesConfigurations = {};

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.SystemPreferencesDAO) preferenceDAO: ISystemPreferencesDAO,
    @inject(TYPES.UUIDGenerator) uuidGenerator: IUUIDGenerator,
    @inject(TYPES.ConfigServiceProvider) configServiceProvider: IConfigServiceProvider
  ) {
    super(logger, configServiceProvider);

    this.preferenceDAO = preferenceDAO;
    this.uuidGenerator = uuidGenerator;
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Check, if a value is for a specific preference key is
   * a valid, by checking it against an array of allowed
   * values.
   * 
   * Allowed values must be configured before in the config
   * object of the instance service
   * 
   * @param {string} preference The preference key
   * @param {any} value The value to check
   * 
   * @returns {boolean} Returns always true, or throw an error
   * 
   * @throws InvalidConfigValueError
   */
  private isAllowedValue(preference: string, value: any): boolean {
    this.logger.log(`Check if value is a valid value for the preference ${preference}`, 'debug');

    if (!this.config[preference] || !this.config[preference].allowedValues) {
      this.logger.log('No allowed values configured, so preference is valid', 'debug');
      return true;
    }

    const index = this.config[preference].allowedValues.indexOf(value);
    if (index === -1) {
      const error = new InvalidConfigValueError(preference, value);
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    this.logger.log('Value is part of the allowed values, so it is valid', 'debug');
    return true;
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Check, if a configuration value is valid for the given preference key.
   * The function uses a config check method, which can be set
   * in the config object of this service instance.
   * 
   * The result of that function ensures that the value is valid
   * 
   * @param {string} preference The preference key
   * @param {any} value The value to check if valid
   * 
   * @returns {Promise<boolean>} Returns true if valid or throw an error
   * 
   * @throws InvalidConfigValueError
   */
  private async checkConfigValue(preference: string, value: any): Promise<boolean> {
    this.logger.log('Check if value is valid, through a configuration check function', 'debug');

    if (!this.config[preference] || !this.config[preference].checkValueFn) {
      this.logger.log('No function configured, so value is valid', 'debug');
      return true;
    }

    let result = false
    try {
      result = await this.config[preference].checkValueFn(value);
    } catch (err) {
      this.logger.log(err, 'warn');
    }

    if (!result) {
      this.logger.log('Check failed, so value is not valid', 'debug');

      const error = new InvalidConfigValueError(preference, value);
      this.logger.log(error.stack, 'warn');
      throw error;
    }

    this.logger.log('Check passed, so value is valid', 'debug');
    return true;
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * The SystemPreference object for each value to the
   * passed preference.
   * 
   * @param {string} preference The preference key, to which the objects should be loaded
   * 
   * @return {Promise<SystemPreferences[]>} The found SystemPreference objects
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private async getPreference(preference: string): Promise<SystemPreferences[]> {
    this.logger.log('Get preferences', 'debug');

    const sp = await this.preferenceDAO.getPreferences(preference);

    if (sp.length > 0) {
      this.logger.log('Set the system preference to the cache', 'debug');
      const values = sp.map(value => value.value);

      if (!this.config[preference]) {
        this.logger.log(`Create configuration for the key '${preference}`, 'debug');
        this.config[preference] = {};
      }

      this.config[preference].cachedValue = values;
    }

    return sp;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Saves the passed in values to the specified preference key in the
   * database. All preference values to the specified preference will
   * be overriden in the database.
   * 
   * @param {string} preference The preference key to store the values to
   * @param {any[]} values The values, which should be stored in the database
   * 
   * @returns {Promise<SystemPreferences[]>} The saved system preferences
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async savePreference(preference: string, values: any[]): Promise<SystemPreferences[]> {
    this.logger.log('Save the system preferences', 'debug');
    this.logger.log(`Number of values to store for the preference '${preference}': ${values.length}`, 'debug');

    const toSet: SystemPreferences[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      this.isAllowedValue(preference, value);
      await this.checkConfigValue(preference, value);
      
      const pref = new SystemPreferences();
      pref.setting = preference;
      pref.value = value;
      pref.id = this.uuidGenerator.generateV4();
      
      toSet.push(pref);
    }

    this.logger.log('System preferences create, now store values in database', 'debug');
    const ret = await this.preferenceDAO.saveOrUpdatePreferences(toSet);

    this.logger.log('System preferences saved to database, now set cached values', 'debug');
    
    if (!this.config[preference]) {
      this.config[preference] = {};
    }

    this.config[preference].cachedValue = values;
    this.logger.log('System preference cached in the service instance', 'debug');
    
    return ret;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Deletes the saved system preference values to the specified settings
   * key form the database
   * 
   * @param {string} preference The preference key of the values, which should be deleted
   * 
   * @returns {Promise<SystemPreferences[]>} The deleted system preferences
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async deletePreference(preference: string): Promise<SystemPreferences[]> {
    this.logger.log('Delete prefrence from the database', 'debug');

    const preferences = await this.preferenceDAO.deletePreference(preference);
    this.logger.log('Prefernce deleted from database, now delete the cached values', 'debug');

    if (this.config[preference]) {
      delete this.config[preference].cachedValue;
      this.logger.log('Cached value deleted', 'debug');
    }

    return preferences;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Checks, if to a sytem preference values are set.
   * Returns true, if values are set, false if not.
   * 
   * @param {string} preference The settings key
   * 
   * @returns {Promise<boolean>} The result
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async isSet(preference: string): Promise<boolean> {
    this.logger.log('Check, if a preference is already set', 'debug');
    this.logger.log(`Check if values for the preference ${preference} is set`, 'debug');

    if (this.config[preference] && typeof this.config[preference].cachedValue !== 'undefined') {
      this.logger.log(`Prefrence '${preference}' set in cache`, 'debug');
      return true;
    }

    this.logger.log('Check, if a default value is set', 'debug');
    if (this.config[preference] && typeof this.config[preference].default !== 'undefined') {
      this.logger.log('Default value for the preference is set, so preference is viewed as set', 'debug');
      return true;
    }

    const prefs = await this.getPreference(preference);
    
    if (prefs && prefs.length > 0) {
      this.logger.log('Preferece is set in database, but not in cache, so now cache value', 'debug');
      if (!this.config[preference]) {
        this.config[preference] = {};
      }

      this.config[preference].cachedValue = prefs.map(value => value.value);
      this.logger.log('Preference values now cached', 'debug');

      return true;
    }
    
    this.logger.log('Preference not set in database', 'debug');
    return false;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Returns only the values, which are set to a preference key.
   * Difference to the getPreference function, is that only the values
   * are returned, not the complete SystemPreference object
   * 
   * @param {string} preference The preference key
   * 
   * @returns {any[]} The values to the prefernce key
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getPreferenceValues(preference: string): Promise<any> {
    this.logger.log('Get only the values for a preference', 'debug');

    if (this.config[preference] && typeof this.config[preference].cachedValue !== 'undefined') {
      this.logger.log('Preference already loaded, so use cached values', 'debug');
      return this.config[preference].cachedValue;
    }

    this.logger.log('System preference not cached, so load it from the database', 'debug');
    const prefs = await this.getPreference(preference);

    if (prefs && prefs.length > 0) {
      return prefs.map(value =>  value.value);
    }

    this.logger.log('System preference is not set in the database, so check if defined in config file', 'debug');
    await this.initConfigService();

    if (this.configService.isSet(preference)) {
      this.logger.log('System preference set in config file', 'debug');

      let values = this.configService.get(preference);
      if (!Array.isArray(values)) {
        values = [values];
      }

      this.logger.log('Set values to the cache', 'debug');
      if (!this.config[preference]) {
        this.config[preference] = {};
      }
      this.config[preference].cachedValue = values;
      
      this.logger.log('Default value set to the config file value', 'debug');
      return values;
    }
    

    if (this.config[preference] && typeof this.config[preference].default !== 'undefined') {
      this.logger.log('Default value is configure, so use this value for the system preference', 'debug');
      this.logger.log('For performance reasons, cache that value', 'debug');

      this.config[preference].cachedValue = this.config[preference].default;
      return this.config[preference].cachedValue;
    }

    return null;
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set the allowed values for the preference keys
   * 
   * @param {string} preference The preference key  
   * @param {Array<any>} values The allowed values
   */
  public setAllowedValues(preference: string, values: any[]): void {
    if (!this.config[preference]) {
      this.config[preference] = {};
    }

    this.config[preference].allowedValues = values;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a function, that checks, if a value is valid
   * 
   * @param {string} preference The preference key
   * @param {Function} fn The function, that check if value is valid
   */
  public setCheckFunction(preference: string, fn: (value: any) => Promise<boolean>): void {
    if (!this.config[preference]) {
      this.config[preference] = {};
    }

    this.config[preference].checkValueFn = fn;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set the default value for a preference key
   * 
   * @param {string} preference The prefrence key 
   * @param {any} value The default value
   */
  public setDefaultValue(preference: string, value: any[]): void {
    if (!this.config[preference]) {
      this.config[preference] = {};
    }

    this.config[preference].default = value;
  }

}
