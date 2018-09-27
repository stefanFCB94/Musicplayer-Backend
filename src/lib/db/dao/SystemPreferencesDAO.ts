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
    @inject(TYPES.DatabaseService) database: IDatabaseService,
  ) {
    super();

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

    this.logger.debug('Initialize repository for the sysem preferences entity');

    try {
      const connection = await this.database.getConnection();
      this.prefRepository = connection.getRepository(SystemPreferences);

      this.logger.debug('StorageFile repository initialized');
    } catch (err) {
      this.logger.error('Repository cannot be initialized. Database connection could not be retrieved');
      this.logger.error(err);
      
      const error  = new ServiceNotInitializedError('IDatabaseService', 'Database service not initialized');
      this.logger.error(error);
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
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  private checkRequiredParameters(preference: SystemPreferences) {
    let error: RequiredParameterNotSet;

    if (!preference.id) {
      this.logger.debug('Required parameter ID not set in the system preference instance');
      error = new RequiredParameterNotSet('id', 'ID not set in system preference value');
    }

    if (!preference.setting) {
      this.logger.debug('Required parameter SETTING not set in the system preference instance');
      error = new RequiredParameterNotSet('setting', 'Setting not set in the system preference value');
    }


    if (error) {
      this.logger.debug('Not all required parameters set');
      this.logger.warn(error);
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
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  private checkParameterOutOfBounds(preference: SystemPreferences) {
    let error: ParameterOutOfBoundsError;

    if (preference.id.length > 36) {
      this.logger.debug(`Parameter ID has a length of ${preference.id.length} and is out of bounds`);
      error = new ParameterOutOfBoundsError('id', 'ID of system preference is out of bounds');
    }

    if (preference.setting.length > 255) {
      this.logger.debug(`Parameter SETTING has a length of ${preference.setting.length} and is out of bounds`);
      error = new ParameterOutOfBoundsError('setting', 'Parameter setting is out of bounds');
    }

    if (preference.value.length > 1024) {
      this.logger.debug(`Parameter VALUE has a length of ${preference.value.length} and is out of bounds`);
      error = new ParameterOutOfBoundsError('value', 'Parameter value is out of bounds');
    }

    if (error) {
      this.logger.debug('At least one parameter is out of bounds');
      this.logger.warn(error);
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
    this.logger.debug('Start checking for paramter errors');
    preferences.forEach((pref) => {
      this.checkRequiredParameters(pref);
      this.checkParameterOutOfBounds(pref);
    });

    this.logger.debug('Open transaction, so that deletion and inserting is transaction save');
    
    const connection = await this.database.getConnection();
    const queryRunner = connection.createQueryRunner();


    try {
      this.logger.debug('Connect with queryRunner to the database (if not established)');
      await queryRunner.connect();


      this.logger.debug('Save and delete should run under transaction, so start transaction now');
      await queryRunner.startTransaction();

      this.logger.debug('Delete all existing system preferences with the same value');
      const deleted = await queryRunner.manager.delete(SystemPreferences, { setting: preferences[0].setting });
      this.logger.debug(`Preferences deleted`);


      this.logger.debug('Current preferences deleted, now insert new values');
      const saved = await queryRunner.manager.save(preferences);
      this.logger.debug('System preferences saved');


      this.logger.debug('All preferences saved successfully to the database, so commit transaction');
      await queryRunner.commitTransaction();
      this.logger.debug('Transactions commited');

      return saved;
    } catch (err) {
      this.logger.debug('Transaction occured, rollback all changes');
      queryRunner.rollbackTransaction();

      this.logger.error(err);
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

    this.logger.debug(`Delete all setting with the settings key: ${preference}`);
    
    const prefs = await this.getPreferences(preference);
    
    if (prefs.length === 0) {
      this.logger.debug('No system preferences match the setting key, so no deletion neccassary');
      return [];
    }

    this.logger.debug('Now try to delete preference values');
    const deleted = await this.prefRepository.remove(prefs);

    this.logger.debug('Preferences deleted from the database');
    this.logger.debug(`Deleted instances: ${deleted.length}`);
    
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

    this.logger.debug(`Get all preference values to the setting key ${preference}`);
    const ret = await this.prefRepository.find({ where: { setting: preference } });

    this.logger.debug(`Found preferences: ${ret.length}`);
    return ret;
  }
  


}
