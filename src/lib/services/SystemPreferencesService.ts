import { BaseService } from '../base/BaseService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../interfaces/services/ILogger';
import { ISystemPreferencesDAO } from '../interfaces/dao/ISystemPreferencesDAO';
import { SystemPreferences } from '../db/models/SystemPreferences';
import { IUUIDGenerator } from '../interfaces/services/IUUIDGenerator';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';

/**
 * @class
 * @public
 * 
 * Service to hanle system preferences.
 * 
 * The service uses the data access object to do typical CRUD operations
 * against the database. All system preferences, which are take care of
 * by this service are stored in the database and no data will be cached.
 * 
 * The behaviour to not store data should be evaluated during the the
 * first productive builds.
 * 
 * @extends BaseService
 */

@injectable()
export class SystemPreferencesService extends BaseService implements ISystemPreferencesService {

  private preferenceDAO: ISystemPreferencesDAO;
  private uuidGenerator: IUUIDGenerator;

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.SystemPreferencesDAO) preferenceDAO: ISystemPreferencesDAO,
    @inject(TYPES.UUIDGenerator) uuidGenerator: IUUIDGenerator,
  ) {
    super(logger);

    this.preferenceDAO = preferenceDAO;
    this.uuidGenerator = uuidGenerator;
  }


  /**
   * @public
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
  getPreference(preference: string): Promise<SystemPreferences[]> {
    this.logger.log('Get preferences', 'debug');

    return this.preferenceDAO.getPreferences(preference);
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
   * @throws {Error}
   */
  savePreference(preference: string, values: any[]): Promise<SystemPreferences[]> {
    this.logger.log('Save the system preferences', 'debug');
    this.logger.log(`Number of values to store for the preference '${preference}': ${values.length}`, 'debug');

    const toSet: SystemPreferences[] = [];
    values.forEach((value) => {
      const pref = new SystemPreferences();
      pref.setting = preference;
      pref.value = value;
      pref.id = this.uuidGenerator.generateV4();
      
      toSet.push(pref);
    });

    this.logger.log('System preferences create, now store values in database', 'debug');
  
    return this.preferenceDAO.saveOrUpdatePreferences(toSet);
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
  deletePreference(preference: string): Promise<SystemPreferences[]> {
    this.logger.log('Delete prefrence from the database', 'debug');

    return this.preferenceDAO.deletePreference(preference);
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
  async isSet(preference: string): Promise<boolean> {
    this.logger.log('Check, if a preference is already set', 'debug');
    this.logger.log(`Check if values for the preference ${preference} is set`, 'debug');

    const prefs = await this.getPreference(preference);
    const set = prefs && prefs.length > 0;

    this.logger.log(`Preference '${preference}' is set: ${set}`, 'debug');
    return set;
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
  async getPreferenceValues(preference: string): Promise<any> {
    this.logger.log('Get only the values for a preference', 'debug');

    const prefs = await this.getPreference(preference);
    this.logger.log('Preference values successfully fetched', 'debug');

    return prefs.map(value =>  value.value);
  }


}
