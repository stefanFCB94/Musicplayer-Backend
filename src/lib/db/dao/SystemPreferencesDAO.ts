import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';

import { TYPES } from '../../types';
import { BaseService } from '../../base/BaseService';

import { SystemPreferences } from '../models/SystemPreferences';

import { ISystemPreferencesDAO } from '../../interfaces/dao/ISystemPreferencesDAO';
import { IDatabaseService } from '../../interfaces/db/IDatabaseService';
import { ILogger } from '../../interfaces/services/ILogger';

import { ServiceNotInitializedError } from '../../error/ServiceNotInitalizedError';
import { RequiredParameterNotSet } from '../../error/db/RequiredParameterNotSetError';
import { ParameterOutOfBoundsError } from '../../error/db/ParameterOutOfBoundsError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Class to handle all database request for the table for the system preferences.
 * Alle inserts, updates, deletes and selects for system prefernce values should run
 * through these class.
 * 
 * The class serves as data access object, which includes different methods
 * for the save storing and receiving information of the system preference values from and
 * to the database.
 * 
 * @requires ILogger
 * @requires IDatabaseService
 * 
 * @extends BaseService
 */

@injectable()
export class SystemPreferencesDAO extends BaseService implements ISystemPreferencesDAO {

  private prefRepository: Repository<SystemPreferences>;
  private database: IDatabaseService;

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.DatabaseService) database: IDatabaseService,
  ) {
    super(logger);

    this.database = database;
  }


   /**
   * @private
   * @author Stefan Läufle
   * 
   * Tries to initialize the repository for the SystemPreferences entities.
   * 
   * If the repository in the singleton instance is already defined,
   * it will return these repository, otherwise it will create a new
   * repository with the database connection from the database
   * service
   * 
   * @returns {Promise<Repository<SystemPreferences>>} The initialized repository
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initialized
   */
  private async initRepository(): Promise<Repository<SystemPreferences>> {
    if (this.prefRepository) { return this.prefRepository; }

    this.logger.log('Initialize repository for the sysem preferences entity', 'debug');

    try {
      const connection = await this.database.getConnection();
      this.prefRepository = connection.getRepository(SystemPreferences);

      this.logger.log('StorageFile repository initialized', 'debug');
    } catch (err) {
      this.logger.log('Repository cannot be initialized. Database connection could not be retrieved', 'error');
      this.logger.log(err.stack, 'error');
      
      const error  = new ServiceNotInitializedError('IDatabaseService', 'Database service not initialized');
      throw error;
    }

    return this.prefRepository;
  }
  

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks, if all required parameters are set in a system preference
   * instance. Throws an RquiredParameterNotSet error, if not all
   * values are set.
   * 
   * @param {SystemPreferences} preference The system preference to check for
   * 
   * @throws {RequiredParemterNotSet} 
   */
  private checkRequiredParameters(preference: SystemPreferences) {
    let error: RequiredParameterNotSet;

    if (!preference.id) {
      this.logger.log('Required parameter ID not set in the system preference instance', 'debug');
      error = new RequiredParameterNotSet('id', 'ID not set in system preference value');
    }

    if (!preference.setting) {
      this.logger.log('Required parameter SETTING not set in the system preference instance', 'debug');
      error = new RequiredParameterNotSet('setting', 'Setting not set in the system preference value');
    }


    if (error) {
      this.logger.log('Not all required parameters set', 'debug');
      this.logger.log(error.stack, 'warn');
      throw error;
    }
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Check if at least one parameter of the passed system preference
   * entity is out of bounds and would throw an error, if saved to
   * the database.
   * 
   * If at least one parameter is out of bounds, the function will
   * throw a ParameterOutOfBoundsError.
   * 
   * @param {SystemPreferences} preference The entity to check for
   * 
   * @throws {ParameterOutOfBoundsError} 
   */
  private checkParameterOutOfBounds(preference: SystemPreferences) {
    let error: ParameterOutOfBoundsError;

    if (preference.id.length > 36) {
      this.logger.log(`Parameter ID has a length of ${preference.id.length} and is out of bounds`, 'debug');
      error = new ParameterOutOfBoundsError('id', 'ID of system preference is out of bounds');
    }

    if (preference.setting.length > 255) {
      this.logger.log(`Parameter SETTING has a length of ${preference.setting.length} and is out of bounds`, 'debug');
      error = new ParameterOutOfBoundsError('setting', 'Parameter setting is out of bounds');
    }

    if (preference.value.length > 1024) {
      this.logger.log(`Parameter VALUE has a length of ${preference.value.length} and is out of bounds`, 'debug');
      error = new ParameterOutOfBoundsError('value', 'Parameter value is out of bounds');
    }

    if (error) {
      this.logger.log('At least one parameter is out of bounds', 'debug');
      this.logger.log(error.stack, 'warn');
      throw error;
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Deletes all existing preferences with the same setting key and
   * inserts the preferences in the value array to the database.
   * 
   * The deletion and saving of the preferences run under a transaction
   * to protect consistency.
   * 
   * Throws a error and rollback all changed, if a error occurs.
   * 
   * @param {Array>SystemPreferences>} preferences The preferences, which should be saved
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {Error}
   */
  async saveOrUpdatePreferences(preferences: SystemPreferences[]): Promise<SystemPreferences[]> {
    await this.initRepository();

    // Check paramter values
    this.logger.log('Start checking for paramter errors', 'debug');
    preferences.forEach((pref) => {
      this.checkRequiredParameters(pref);
      this.checkParameterOutOfBounds(pref);
    });

    this.logger.log('Open transaction, so that deletion and inserting is transaction save', 'debug');
    
    const connection = await this.database.getConnection();
    const queryRunner = connection.createQueryRunner();


    try {
      this.logger.log('Connect with queryRunner to the database (if not established)', 'debug');
      await queryRunner.connect();


      this.logger.log('Save and delete should run under transaction, so start transaction now', 'debug');
      await queryRunner.startTransaction();

      this.logger.log('Delete all existing system preferences with the same value', 'debug');
      const deleted = await queryRunner.manager.delete(SystemPreferences, { setting: preferences[0].setting });
      this.logger.log(`Preferences deleted`, 'debug');


      this.logger.log('Current preferences deleted, now insert new values', 'debug');
      const saved = await queryRunner.manager.save(preferences);
      this.logger.log('System preferences saved', 'debug');


      this.logger.log('All preferences saved successfully to the database, so commit transaction', 'debug');
      await queryRunner.commitTransaction();
      this.logger.log('Transactions commited', 'debug');

      return saved;
    } catch (err) {
      this.logger.log('Transaction occured, rollback all changes', 'debug');
      queryRunner.rollbackTransaction();

      this.logger.log(err.stack, 'error');
      throw err;
    }
  }


  /**
   * @public 
   * @author Stefan Läufle
   * 
   * Deletes all system preference values with a specific setting key.
   * 
   * @param {string} preference The setting key, which should be deleted
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  async deletePreference(preference: string): Promise<SystemPreferences[]> {
    await this.initRepository();

    this.logger.log(`Delete all setting with the settings key: ${preference}`, 'debug');
    
    const prefs = await this.getPreferences(preference);
    
    if (prefs.length === 0) {
      this.logger.log('No system preferences match the setting key, so no deletion neccassary', 'debug');
      return [];
    }

    this.logger.log('Now try to delete preference values', 'debug');
    const deleted = await this.prefRepository.remove(prefs);

    this.logger.log('Preferences deleted from the database', 'debug');
    this.logger.log(`Deleted instances: ${deleted.length}`, 'debug');
    
    return deleted;
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Find all system preferences, to a specific setting key.
   * 
   * @param {string} preference The setting key, which should be queried for
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  async getPreferences(preference: string): Promise<SystemPreferences[]> {
    await this.initRepository();

    this.logger.log(`Get all preference values to the setting key ${preference}`, 'debug');
    const ret = await this.prefRepository.find({ where: { setting: preference } });

    this.logger.log(`Found preferences: ${ret.length}`, 'debug');
    return ret;
  }
  


}
