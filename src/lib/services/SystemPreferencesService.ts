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
    @inject(TYPES.SystemPreferencesDAO) preferenceDAO: ISystemPreferencesDAO,
    @inject(TYPES.UUIDGenerator) uuidGenerator: IUUIDGenerator,
    @inject(TYPES.ConfigServiceProvider) configServiceProvider: IConfigServiceProvider
  ) {
    super(configServiceProvider);

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
    this.logger.debug(`Check if value is a valid value for the preference ${preference}`);

    if (!this.config[preference] || !this.config[preference].allowedValues) {
      this.logger.debug('No allowed values configured, so preference is valid');
      return true;
    }

    const index = this.config[preference].allowedValues.indexOf(value);
    if (index === -1) {
      const error = new InvalidConfigValueError(preference, value);
      this.logger.warn(error);

      throw error;
    }

    this.logger.debug('Value is part of the allowed values, so it is valid');
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
    this.logger.debug('Check if value is valid, through a configuration check function');

    if (!this.config[preference] || !this.config[preference].checkValueFn) {
      this.logger.debug('No function configured, so value is valid');
      return true;
    }

    let result = false
    try {
      result = await this.config[preference].checkValueFn(value);
    } catch (err) {
      this.logger.warn(err);
    }

    if (!result) {
      this.logger.debug('Check failed, so value is not valid');

      const error = new InvalidConfigValueError(preference, value);
      this.logger.warn(error);
      throw error;
    }

    this.logger.debug('Check passed, so value is valid');
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
    this.logger.debug(`Get preferences ${preference}`);

    const sp = await this.preferenceDAO.getPreferences(preference);

    if (sp.length > 0) {
      this.logger.debug(`Set the system preference for key ${preference} to the cache`);
      const values = sp.map(value => value.value);

      if (!this.config[preference]) {
        this.logger.debug(`Create configuration for the key '${preference}`);
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
    this.logger.debug(`Save the system preferences ${preference}`);
    this.logger.debug(`Number of values to store for the preference '${preference}': ${values.length}`);

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

    this.logger.debug(`System preferences ${preference} created, now store values in database`);
    const ret = await this.preferenceDAO.saveOrUpdatePreferences(toSet);

    this.logger.debug(`System preferences ${preference} saved to database, now set cached values`);
    
    if (!this.config[preference]) {
      this.config[preference] = {};
    }

    this.config[preference].cachedValue = values;
    this.logger.debug(`System preference ${preference} cached in the service instance`);
    
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
    this.logger.debug(`Delete preference ${preference} from the database`);

    const preferences = await this.preferenceDAO.deletePreference(preference);
    this.logger.debug(`Preference ${preference} deleted from database, now delete the cached values`);

    if (this.config[preference]) {
      delete this.config[preference].cachedValue;
      this.logger.debug(`Cached value for ${preference} deleted`);
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
    this.logger.debug(`Check, if preference ${preference} is already set`);

    if (this.config[preference] && typeof this.config[preference].cachedValue !== 'undefined') {
      this.logger.debug(`Prefrence '${preference}' set in cache`);
      return true;
    }

    this.logger.debug(`Check, if a default value for the preference ${preference} is set`);
    if (this.config[preference] && typeof this.config[preference].default !== 'undefined') {
      this.logger.debug('Default value for the preference ${preference} is set, so preference is viewed as set');
      return true;
    }

    const prefs = await this.getPreference(preference);
    
    if (prefs && prefs.length > 0) {
      this.logger.debug(`Preferece ${preference} is set in database, but not in cache, so now set cache value`);
      if (!this.config[preference]) {
        this.config[preference] = {};
      }

      this.config[preference].cachedValue = prefs.map(value => value.value);
      this.logger.debug(`Preference values for ${preference} now cached`);

      return true;
    }
    
    this.logger.debug(`Preference ${preference} not set in database`);
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
    this.logger.debug(`Get only the values for a preference ${preference}`);

    if (this.config[preference] && typeof this.config[preference].cachedValue !== 'undefined') {
      this.logger.debug(`Preference ${preference} already loaded, so use cached values`);
      return this.config[preference].cachedValue;
    }

    this.logger.debug(`System preference ${preference} not cached, so load it from the database`);
    const prefs = await this.getPreference(preference);

    if (prefs && prefs.length > 0) {
      return prefs.map(value =>  value.value);
    }

    this.logger.debug(`System preference ${preference} is not set in the database, so check if defined in config file`);
    await this.initConfigService();

    if (this.configService.isSet(preference)) {
      this.logger.debug(`System preference ${preference} set in config file`);

      let values = this.configService.get(preference);
      if (!Array.isArray(values)) {
        values = [values];
      }

      this.logger.debug(`Set values for preference ${preference} to the cache`);
      if (!this.config[preference]) {
        this.config[preference] = {};
      }
      this.config[preference].cachedValue = values;
      
      this.logger.debug(`Default value for preference ${preference} set to the config file value`);
      return values;
    }
    

    if (this.config[preference] && typeof this.config[preference].default !== 'undefined') {
      this.logger.debug('Default value is configured, so use this value for the system preference');
      this.logger.debug('For performance reasons, cache that value');

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
