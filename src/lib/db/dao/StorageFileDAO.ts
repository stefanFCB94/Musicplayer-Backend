import { Repository, FindManyOptions } from 'typeorm';
import { inject } from 'inversify';

import { TYPES } from '../../types';

import { BaseService } from '../../base/BaseService';
import { StorageFile } from '../models/StorageFile';
import { OrderDirectionEnum } from '../../enums/OrderDirection';

import { IStorageFileDAO } from '../../interfaces/dao/IStorageFileDAO';
import { ILogger } from '../../interfaces/services/ILogger';
import { IDatabaseService } from '../../interfaces/db/IDatabaseService';

import { ServiceNotInitializedError } from '../../error/ServiceNotInitalizedError';
import { RequiredParameterNotSet } from '../../error/db/RequiredParameterNotSetError';
import { ParameterOutOfBoundsError } from '../../error/db/ParameterOutOfBoundsError';
import { NotAUniqueValueError } from '../../error/db/NotAUniqueValueError';


export class StorageFileDAO extends BaseService implements IStorageFileDAO {
  
  private fileRepository: Repository<StorageFile>;
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
   * Tries to initialize the repository for the StorageFile entities.
   * 
   * If the repository in the singleton instance is already defined,
   * it will return these repository, otherwise it will create a new
   * repository with the database connection from the database
   * service
   * 
   * @returns {Promise<Repository<StorageFile>>} The initialized repository
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initialized
   */
  private async initRepository(): Promise<Repository<StorageFile>> {
    if (this.fileRepository) { return this.fileRepository; }

    this.logger.debug('Initialize repository for the storage file entity');

    try {
      const connection = await this.database.getConnection();
      this.fileRepository = connection.getRepository(StorageFile);

      this.logger.debug('StorageFile repository initialized');
    } catch (err) {
      this.logger.debug('Repository cannot be initialized. Database connection could not be retrieved');
      this.logger.error(err);
      
      const error  = new ServiceNotInitializedError('IDatabaseService', 'Database service not initialized');
      this.logger.error(error);
      throw error;
    }

    return this.fileRepository;
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks if all required parameters of a storage file entity are
   * set in the function parameter.
   * If not all required parameters are set, the function will throw
   * a RequiredParameterNotSetError
   * 
   * @param {StorageFile} file The entity, which should be checked
   * 
   * @throws {RequiredParameterNotSetError} If required parameter in entity is not set
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  private checkRequiredParameter(file: StorageFile) {
    let error: RequiredParameterNotSet;

    if (!file.id) {
      this.logger.debug('ID of storage file entity is not set');
      error = new RequiredParameterNotSet('id', 'ID for storage file is not set');
    }

    if (!file.path) {
      this.logger.debug('Path of the storage file is not set');
      error = new RequiredParameterNotSet('path', 'Path of the storage file is not set');
    }

    if (!file.checksum) {
      this.logger.debug('MD5 checksum of storage file entity is not set');
      error = new RequiredParameterNotSet('checksum', 'MD5 checksum of storage file ist not set');
    }

    if (!file.filesize) {
      this.logger.debug('Filesize of the storage file entity is not set');
      error = new RequiredParameterNotSet('filesize', 'Filesize of the storage file is not set');
    }


    if (error) {
      this.logger.debug('Not all required parameter are set in the storage file entity');
      this.logger.warn(error);
      throw error;
    }
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks, if all parameters of the entity passed to the function,
   * are in the bounds, which are defined by the database fields.
   * 
   * If at least one parameter is out of bounds, a ParameterOutOfBoundsError
   * is thrown be the function.
   * 
   * @param {StorageFile} file The storage file, which should be checked
   * 
   * @throws {ParameterOutOfBoundsError} If at least one parameter is out bounds
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  private checkParameterOutOfBound(file: StorageFile) {
    let error: ParameterOutOfBoundsError;

    if (file.id.length > 36) {
      this.logger.debug('ID is out of bounds for storage file');
      error = new ParameterOutOfBoundsError('id', 'ID of storage file is out of bounds');
    }

    if (file.path.length > 1024) {
      this.logger.debug('Path of storage file is out of bounds');
      error = new ParameterOutOfBoundsError('path', 'Path of storage file is out of bounds');
    }

    if (file.checksum.length > 32) {
      this.logger.debug('MD5 checksum of storage file is out of bounds');
      error = new ParameterOutOfBoundsError('checksum', 'MD5 checksum of storage file is out of bounds');
    }

    if (error) {
      this.logger.debug('At least one parameter of storage file is out of bounds');
      this.logger.warn(error);
      throw error;
    }
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks, if all unique parameters of a storage file are unique.
   * 
   * The function checks, if for the storage file passed as parameter
   * alreday storage files in the database exists, which has the same
   * unique value. If a storage file already had the unique value of
   * the parameter storage file, the function will throw a
   * NotAUniqueValueError.
   * 
   * A error will defined, if a entity with another id as the paremter
   * entity has for a unique value the same value.
   * 
   * @param {StorageFile} file The entity, which should be checked
   * 
   * @throws {NotAUniqueValueError} If at least one value of entity has not a unique value. 
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  private async checkUniqueParameters(file: StorageFile) {
    await this.initRepository();
    
    let error: NotAUniqueValueError;
    this.logger.debug('Check for unique values');

    const foundChecksumFile = await this.getFileByChecksum(file.checksum);
    if (foundChecksumFile && foundChecksumFile.id !== file.id) {
      error = new NotAUniqueValueError('checksum', file.checksum, 'File with checksum already exists');
      this.logger.debug(`File with checksum '${file.checksum}' alredy exists`);
    }

    if (error) {
      this.logger.debug('At least one unique parameter is not unique');
      this.logger.warn(error);

      throw error;
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Saves or updates a storage file entity to the database.
   * 
   * If the entity with the same id is already saved in the database,
   * the file will be updated. If the entity with the id is not already
   * created in the database, the entity will be inserted.
   * 
   * Checks, if all required parameter are set and are in bound in the
   * passed enitity. If not a error will be thrown and the entity will
   * not be saved to the database.
   * 
   * Also checks, if the checksum in the file is unique. Function is used
   * to identify already saved files, to pretend the storage of duplicate
   * files.
   * 
   * @param {StorageFile} file The file, which should be saved in the database
   * 
   * @returns {Promise<StorageFile>} Returns the saved storage file
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initialized
   * @throws {RequiredParameterNotSetError} If a required parameter is not set
   * @throws {ParameterOutOfBoundsError} If a parameter is out of bounds
   * @throws {NotAUniqueValueError} If a parameter value is not unique
   * @throws {Error} If a unsupported error occurs
   */
  public async saveOrUpdateFile(file: StorageFile): Promise<StorageFile> {
    await this.initRepository();

    this.logger.debug('Start checking parameters of storage file');
    this.checkRequiredParameter(file);
    this.checkParameterOutOfBound(file);
    await this.checkUniqueParameters(file);

    try {
      const savedFile = await this.fileRepository.save(file);
      this.logger.debug('StorageFile saved successfully saved to database');

      return savedFile;
    } catch (err) {
      this.logger.error(err);
      this.logger.debug('Unsupported error by savind storage file to database');

      throw err;
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get all storage files from the database.
   * 
   * The returned entities can be defined with four parameters.
   * With the orderCol and orderDir the order of the return set
   * can be defined. With skip and maxItems parameter the number
   * or result can be limited and a pagination component can be
   * realised.
   * 
   * If the repository could not be initialized or a unsupported
   * error occures, the function will throw a error.
   * 
   * @param {string} orderCol Name of the column, with which the results should be orderd
   * @param {OrderDirectionEnum} orderDir Define, if the results shoudl be orderd ascending or descending
   * @param {number} skip The number or entities, which should be skipped
   * @param {number} maxItems The number of entities, that should be returned 
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initialized
   * @throws {Error} If a unsupported error occurs
   */
  public async getFiles(
    orderCol: string = 'created_at', 
    orderDir: OrderDirectionEnum = OrderDirectionEnum.ASCENDING,
    skip?: number,
    maxItems?: number,
  ): Promise<StorageFile[]> {
    await this.initRepository();

    this.logger.debug('Start querying for storage files');

    const options: FindManyOptions = {
      skip,
      take: maxItems,
      order: { [orderCol]: orderDir },
    };

    try {
      const ret = await this.fileRepository.find(options);
      this.logger.debug('Query for storage file finished');
      this.logger.debug(`Found results: ${ret.length}`);

      return ret;
    } catch (err) {
      this.logger.debug('Unsupported error by querying the database for storage files');
      this.logger.error(err);

      throw err;
    }
  }
  
  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Try to get a storage file by the id from the database.
   * 
   * Function query the database for a storage file. Userd for
   * query the database to find the storage file, the id passed in
   * as parameter is used.
   * 
   * If a unsupported error occurs or the repository could not be
   * initialized, a error is thrown.
   * 
   * @param {string} id The ID used to query the database for a storage file
   * 
   * @returns {Promise<StorageFile>} The found storage file, null if no file is found
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initialized
   * @throws {Error} If a unsupported error occurs
   */
  public async getFile(id: string): Promise<StorageFile> {
    await this.initRepository();

    this.logger.debug('Start querying for a specific storage file by id');
    this.logger.debug(`Storage file with the id '${id}' should be searched`);

    try {
      const file = await this.fileRepository.findOne({ where: { id } });
      this.logger.debug('Querying for storage file finished');

      if (file) {
        this.logger.debug('Storage file was found in the database');
      } else {
        this.logger.debug('Storage file was not found in the database');
      }

      return file;
    } catch (err) {
      this.logger.debug('Unsupported error during querying for storage file by id');
      this.logger.error(err);

      throw err;
    }
  }
  
  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Query the database for a file by MD5 checksum.
   * 
   * The function will return the found file with the MD5 checksum,
   * passed as parameter. If no file was found, matching the checksum
   * the function will return null.
   * 
   * If a unsupported error occurs or the repository could not be
   * initialized, the function will throw a error.
   * 
   * @param {string} checksum The MD5 checksum, which should be used for querying the database
   * 
   * @returns {Promise<StorageFile>} The found storage file; null, if file was not found
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initalized
   * @throws {Error} If a unsupported error occurs
   */
  public async getFileByChecksum(checksum: string): Promise<StorageFile> {
    await this.initRepository();

    this.logger.debug('Start querying for file by checksum');
    this.logger.debug(`Try to get file by MD5 checksum '${checksum}`);

    try {
      const file = await this.fileRepository.findOne({ where: { checksum } });

      this.logger.debug('Querying for file by MD5 checksum finished');
      if (file) {
        this.logger.debug('Storage file was found by MD5 checksum');
      } else {
        this.logger.debug('Storage file was not found by MD5 checksum');
      }

      return file;
    } catch (err) {
      this.logger.debug('A unsupported error by querying the database for storage file by MD5 checksum occured');
      this.logger.error(err);

      throw err;
    }
  }
  
  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Tries to delete a storage file from the database.
   * 
   * The function deletes the storage file, which is passed as parameter
   * of the function. If the file was deleted successfully from the
   * database, the function will return the delted entity. If the 
   * storage file could not be found in the database, the function will
   * return null instead.
   * 
   * If the repository could not be initialized of a unsupported error
   * occured, the function will throw a error.
   * 
   * @param {StorageFile} file The storage file, which should be deleted from the database
   * 
   * @returns {Promise<StorageFile>} The deleted storage file; Null, if the file was not found in the database
   * 
   * @throws {ServiceNotInitializedError} If the repository could not be initilized
   * @throws {Error} If a unsupported file occured by deleting the storage file
   */
  public async deleteFile(file: StorageFile): Promise<StorageFile> {
    await this.initRepository();

    this.logger.debug('Start deleting storage file');

    try {
      const deletedFile = await this.fileRepository.remove(file);

      this.logger.debug('Deletion of storage file finished');
      if (deletedFile) {
        this.logger.debug('Storage file deleted from database');
      } else {
        this.logger.debug('Storage file was not found');
      }

      return deletedFile;
    } catch (err) {
      this.logger.debug('A unsupported error occured by deleting a storage file');
      this.logger.error(err);

      throw err;
    }
  }
  
}
