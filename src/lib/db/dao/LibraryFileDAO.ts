import { Repository } from 'typeorm';
import { inject } from 'inversify';

import { TYPES } from '../../types';

import { BaseService } from '../../base/BaseService';
import { LibraryFile } from '../models/LibraryFile';

import { ILibraryFileDAO } from '../../interfaces/dao/ILibraryFileDAO';
import { IDatabaseService } from '../../interfaces/db/IDatabaseService';

import { ServiceNotInitializedError } from '../../error/ServiceNotInitalizedError';
import { RequiredParameterNotSet } from '../../error/db/RequiredParameterNotSetError';
import { ParameterOutOfBoundsError } from '../../error/db/ParameterOutOfBoundsError';
import { NotAUniqueValueError } from '../../error/db/NotAUniqueValueError';


export class LibraryFileDAO extends BaseService implements ILibraryFileDAO {
  
  private fileRepository: Repository<LibraryFile>;
  private database: IDatabaseService;

  constructor(
    @inject(TYPES.DatabaseService) database: IDatabaseService,
  ) {
    super();

    this.database = database;
  }


  /**
   * @private
   * 
   * Tries to initalize the repository for the LibraryFile table.
   * 
   * If the repository is already initialzed in the singleton instance,
   * the already defined repository is used.
   * 
   * If the repository is not initalized before, a new repository
   * will be created through the database connection of the IDatabaseService.
   * 
   * If the database connection could not be retrieved, a 
   * ServiceNotInitializedError will be logged an thrown.
   * 
   * @returns {Promise<Repository<LibraryFile>>} The initalized repository
   * 
   * @throws {ServiceNotInitializedError}
   */
  private async initRespository(): Promise<Repository<LibraryFile>> {
    if (this.fileRepository) { return this.fileRepository; }

    this.logger.debug('Initialize repository for the library files table');

    try {
      const connection = await this.database.getConnection();
      this.fileRepository = connection.getRepository(LibraryFile);

      this.logger.debug('LibraryFile repository successfully initialized');
    } catch (err) {
      this.logger.debug('Repository cannot be initialized. Database connection could not be retrieved');
      this.logger.error(err);

      const error = new ServiceNotInitializedError('IDatabaseService', 'Database service not fully initialized');
      this.logger.error(error);
      throw error;
    }

    return this.fileRepository;
  }


  /**
   * @private
   * 
   * Check of all required parameters of the library file are set
   * in the entity, which is passed in as first parameter.
   * 
   * If not all required parameters are set, the function will
   * throw a new RequiredParameterNotSetError.
   *  
   * @param {LibraryFile} file The entity, which should be checked
   * 
   * @throws {RequiredParameterNotSetError} If not all required parameter are set 
   */
  private checkRequiredParameters(file: LibraryFile) {
    let error: RequiredParameterNotSet;

    if (!file.id) {
      this.logger.debug('ID of the library file entity must be set');
      error = new RequiredParameterNotSet('id', 'ID of the library file must be set');
    }
    
    if (!file.path) {
      this.logger.debug('Absolute path of the library file must be set');
      error = new RequiredParameterNotSet('path', 'The path to the library file must be set');
    }

    if (!file.checksum) {
      this.logger.debug('The MD5 checksum of the library file must be set');
      error = new RequiredParameterNotSet('checksum', 'MD5 checksum must be set');
    }

    if (!file.filesize) {
      this.logger.debug('The size of the library file must be set');
      error = new RequiredParameterNotSet('filesize', 'Filesize of the library file must be set');
    }

    
    if (error) {
      this.logger.debug('Not all required parameters are set for the library file');
      this.logger.warn(error);
      throw error;
    }
  }

  /**
   * @private
   * 
   * Checks, if all string values of the library file, which is
   * passed in as first parameter, is in bounds.
   * 
   * If at least one string value is out of bounds, the function
   * will throw a ParameterOutOfBoundsError.
   * 
   * @param {LibraryFile} file:The file to check
   * 
   * @throws {ParameterOutOfBoundsError}
   */
  private checkParameterOutOfBounds(file: LibraryFile) {
    let error: ParameterOutOfBoundsError;

    if (file.id.length > 36) {
      this.logger.debug('ID of the library file is out of bounds');
      error = new ParameterOutOfBoundsError('id', 'ID of library file is out of bounds');
    }

    if (file.path.length > 1024) {
      this.logger.debug('Path of library file is out of bounds');
      error = new ParameterOutOfBoundsError('path', 'The path of the library file is out of bounds');
    }

    if (file.checksum.length > 32) {
      this.logger.debug('Checksum of library file is out of bounds');
      error = new ParameterOutOfBoundsError('checksum', 'MD5 checksum is out of bounds');
    }


    if (error) {
      this.logger.debug('At least one parameter of the library file is out of bounds');
      this.logger.warn(error);
      throw error;
    }
  }

  /**
   * @private
   * @async
   * 
   * Checks, of all unique values of a library file, which is passed
   * in as first parameter, are unique in the table.
   * 
   * If at least one unique value is already defined in the database
   * table, a NotAUniqueValueError will be thrown.
   * 
   * @param {LibraryFile} file The entity to check
   * 
   * @throws {NotAUniqueValueError}
   * @throws {ServiceNotInitializedError} 
   */
  private async checkUniqueParameters(file: LibraryFile) {
    await this.initRespository();

    let error: NotAUniqueValueError;
    this.logger.debug('Check for unique values');

    const foundChecksumFile = await this.getFileByChecksum(file.checksum);
    if (foundChecksumFile && foundChecksumFile.id !== file.id) {
      error = new NotAUniqueValueError('checksum', file.checksum, 'Library file with checksum already exists');
      this.logger.debug(`File with checksum ${file.checksum} already exists`);
    }

    if (error) {
      this.logger.debug('At least one unique parameter is not unique');
      this.logger.warn(error);

      throw error;
    }
  }


  /**
   * @public
   * @async
   * 
   * Insert a new file, if no file with id is saved in the databse.
   * Updateds instance in the database, if library file with the ID
   * is already saved.
   * 
   * Function checks before writing to the database, if the kparameters
   * are all valid.
   * 
   * If not all parameters are valid, the corresponding error will be thrown.
   * 
   * If file is saved successfully, the saved instance will be returned
   * by the function
   * 
   * @param {LibraryFile} file The file, that should be saved in  the database
   * 
   * @returns {Promise<LibraryFile>} The saved instance
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {RequiredParameterNotSetError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {NotAUniqueValueError}
   * @throws {Error}
   */
  public async saveOrUpdateFile(file: LibraryFile): Promise<LibraryFile> {
    await this.initRespository();

    this.logger.debug('Start checking parameters of library file');
    this.checkRequiredParameters(file);
    this.checkParameterOutOfBounds(file);
    await this.checkUniqueParameters(file);

    try {
      const savedFile = await this.fileRepository.save(file);
      this.logger.debug('LibraryFile successfully saved to database');

      return savedFile;
    } catch (err) {
      this.logger.error(err);
      this.logger.debug('Unsupported error by saving library file');

      throw err;
    }
  }

  /**
   * @public
   * @async
   * 
   * Query the database for library file by the unique MD5 checksum.
   * 
   * If the file was found, the library file entity is returned.
   * If the file was not found, null is returned
   * 
   * @param {string} checksum The MD5 checksum to search for
   * 
   * @returns {Promise<LibraryFile>} The found library file
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  public async getFileByChecksum(checksum: string): Promise<LibraryFile> {
    await this.initRespository();

    this.logger.debug('Starting querying for file by checksum');
    this.logger.debug(`Try to get library file with MD5 checksum '${checksum}'`);

    try {
      const file = await this.fileRepository.findOne({ where: { checksum } });

      this.logger.debug('Querying for library file by MD5 checksum has successfully ended');
      if (file) {
        this.logger.debug('Library file was found by MD5 checksum');
      } else {
        this.logger.debug('Library file was not found by MD5 checksum');
      }

      return file;
    } catch (err) {
      this.logger.debug('An unsupported error by querying the database for library file');
      this.logger.error(err);

      throw err;
    }
  }

  /**
   * @public
   * @async
   * 
   * Deletes a library file from the database.
   * 
   * The function will return the deleted library file instance, if the
   * file could be deleted.
   * If the file cound not be found, null is returned
   * 
   * @param  {LibraryFile} file The library file to delete
   * 
   * @returns {Promise<LibraryFile>} The deleted instance
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async deleteFile(file: LibraryFile): Promise<LibraryFile> {
    await this.initRespository();

    this.logger.debug('Start deleting library file');

    try {
      const deletedFile = await this.fileRepository.remove(file);

      this.logger.debug('Deleting of the libary file successfully ended');
      if (deletedFile) {
        this.logger.debug('Library file was successfully deleted');
      } else {
        this.logger.debug('Library file was not found');
      }

      return deletedFile;
    } catch (err) {
      this.logger.debug('An unsupported error occured by deleting library file');
      this.logger.error(err);

      throw err;
    }
  }

  /**
   * @public
   * @async
   * 
   * Get all library file information, which are stored in the database.
   * 
   * The function will return all stored information about the library
   * files. Do not use this function to get the library files for the user
   * For that use a function with pagination support.
   * 
   * @returns {Promise<LibraryFile[]>} All library files
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getAllFiles(): Promise<LibraryFile[]> {
    await this.initRespository();

    this.logger.debug('Start querying all file information');

    try {
      const files = await this.fileRepository.find();
      this.logger.debug(`Query finished. Found results: ${files.length}`);

      return files;
    } catch (err) {
      this.logger.debug('An unsupported error occured by deleting library file');
      this.logger.error(err);

      throw err;
    }
  }
}
