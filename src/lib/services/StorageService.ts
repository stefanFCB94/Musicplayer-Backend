import * as fs from 'fs-extra';
import * as mkdirp from 'mkdirp';

import { IStorageService } from '../interfaces/services/IStorageService';
import { BaseSystemPreferenceService } from '../base/BaseSystemPreferenceService';

import { TYPES } from '../types';
import { inject } from 'inversify';

import { ILogger } from '../interfaces/services/ILogger';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';

import { RequiredConfigParameterNotSetError } from '../error/config/RequiredConfigParamterNotSetError';
import { StorageNotExistsError } from '../error/server/StorageNotExistsError';
import { StorageNotWritableError } from '../error/server/StorageNotWritableError';
import { StoragePathNotCreatableError } from '../error/server/StoragePathNotCreateableError';
import { StorageFileNotExistingError } from '../error/server/StorageFileNotExistingError';
import { StorageFileNotDeletableError } from '../error/server/StorageFileNotDeletableError';


export class StorageService extends BaseSystemPreferenceService implements IStorageService {

  private baseStorageKey: string = 'STORAGE.PATH';


  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.SystemPreferencesService) systemPreferenceService: ISystemPreferencesService,
  ) {
    super(logger, systemPreferenceService);
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks if the storage exists.
   * Path to be checked must be given as parameter.
   * 
   * Storage is not read from the system preference service
   * for performance reasons.
   * 
   * @param {string} path The path of the storage
   * @returns {Promise<boolean>} true
   * 
   * @throws {StorageNotExistsError}
   */
  private async existsStorage(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);

      if (!stats.isFile()) {
        return true;
      }
    } catch (err) {
      this.logger.log(err.stack, 'error');
    }

    const error = new StorageNotExistsError(path, 'Path does not exists on the filesystem');
    this.logger.log(error.stack, 'error');
    throw error;
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks if a path is writable.
   * Works only on Linux and Mac systems, on Windows
   * the API for the user access rights is not good enough.
   * 
   * @param {string} path Full path to be checked
   * @returns {Promise<boolean>} true
   *  
   * @throws {StorageNotWritableError} If the path is not writable
   */
  private async isWritable(path: string): Promise<boolean> {
    if (process.platform !== 'win32') {
      const hasWrite = await fs.access(path, fs.constants.W_OK);
      if (!hasWrite) {
        const error = new StorageNotWritableError(path, 'Path is not writable');
        this.logger.log(error.stack, 'error');
        throw error;
      }
    }

    return true;
  }


  /**
   * Create subdirectory in the storage.
   * Subdirectory should be passed to the function, with the full path
   * (e.g. 'abc/def/ghi).
   * 
   * Function creates directory, if does not exists. If subdirectory
   * already exists, it resoles without doing a thing.
   * 
   * If a error happens while creatind the subdirectory, the promise will
   * be rejected with that error;
   * 
   * @private
   * @param {string} path The path of the subdirectory, whicht should
   *                      be created in the storage
   * 
   * @returns {Promise<void>} Resolves, if directory exists or was successfully created
   *                          Rejects with the appeared error 
   * 
   * @throws {StoragePathNotCreatableError}
   */
  private async createSubdir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      mkdirp(path, (err) => {
        if (err) {
          this.logger.log(err.stack, 'error');

          const error = new StoragePathNotCreatableError(path, 'Path not creatable');
          this.logger.log(error.stack, 'error');
          throw error;
        }

        this.logger.log(`Path '${path}' created`, 'debug');
        resolve();
      });
    });
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Gets the configured path to the base storage from the system
   * preference service. Returns null, if path is not defined
   * 
   * @returns {Promise<string>} The setted storage parameter
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getBaseStorage(): Promise<string> {
    const storage = await this.systemPreferenceService.getPreferenceValues(this.baseStorageKey);
    
    if (!storage || storage.length === 0){
      return null;
    }

    return storage[0];
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a new base storage to the system prefernces.
   * Default all contents of the old storage will be moved to the
   * new storage.
   * 
   * @param {string} path The path to the new storage 
   * @param {object} opts Options for the function
   * @param {boolean} opts.moveContent Default true, if the content should be moved to new storage
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {StorageNotExistsError}
   * @throws {StorageNotWritableError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {Error}
   */
  public async setBaseStorage(path: string, opts?: { moveContent?: boolean }): Promise<void> {
    this.logger.log('Set the base storage for the server', 'debug');

    // CHeck, if new storage path exists
    await this.existsStorage(path);

    // Check, if new storage path is writable
    await this.isWritable(path);

    const oldPath = await this.getBaseStorage();
    await this.systemPreferenceService.savePreference(this.baseStorageKey, [path]);

    // If option moveContent is set to a true or is not defined value
    // the service tries to move all contents from the old storage to
    // the new one
    if (oldPath && oldPath !== path && (!opts || typeof opts.moveContent === 'undefined' || opts.moveContent)) {
      this.logger.log('Move all contents of the old storage to the new one', 'debug');
      const content = await fs.readdir(oldPath);

      content.forEach(async element => {
        const source = oldPath + '/' + element;
        const target = path + '/' + element;

        await fs.move(source, target, { overwrite: true });
        this.logger.log(`${element} moved to new storage`, 'debug');
      });

      this.logger.log('All content elements moved to new storage directory', 'debug');
    }
  }


  /**
   * Saves a file in the defined storage space.
   * As parameter the subdirectory of the storage, the filename for the file
   * and the buffer of the file should be passed to the function.
   * 
   * Function creates subdirectory, if it doesn't exists already.
   * The buffer will be saved with the passed filename in the passed subdirectory
   * of the storage.
   * 
   * @public
   * 
   * @param {string} path The subdirectory of the storage the file should be saved in
   * @param {string} filename The name of the file to be saved
   * @param {Buffer} file The file, which should be saved
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {RequiredConfigParameterNotSetError}
   * @throws {StorageNotExistsError}
   * @throws {StoragePathNotCreateableError}
   * @throws {StorageNotWritableError}
   * @throws {Error}
   */
  public async saveFile(path: string, filename: string, file: Buffer): Promise<string> {
    const baseStorage = await this.getBaseStorage();
    if (!baseStorage) {
      const error = new RequiredConfigParameterNotSetError(this.baseStorageKey, 'Storage must be defined');
      this.logger.log('File could not be saved. Storage not defined', 'error');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    const pathToSaveIn = baseStorage + '/' + path;
    const exists = await this.exists(path);

    if (!exists) {
      this.logger.log('Path, where the file should be created not available, check if base storage exists', 'debug');
      await this.existsStorage(baseStorage);
 
      this.logger.log('Path has to be created', 'debug');
      await this.createSubdir(pathToSaveIn);
    }

    // Check, if storage path is writable
    // throws StorageNotWritableError
    await this.isWritable(pathToSaveIn);

    this.logger.log('Path exists and can be writen in. Now write file to filesystem', 'debug');
    const filepath = pathToSaveIn + '/' + filename;
    try {
      await fs.writeFile(filepath, file);
    } catch (err) {
      this.logger.log(err.stack, 'error');

      const error = new StorageNotWritableError(filepath, 'File could not be saved in storage');
      this.logger.log(error.stack, 'error');
      throw error;
    }

    return filepath;
  }
  
  /**
   * Delete a file from the storage.
   * 
   * Uses the system preference for the base storage to defined, where
   * to the delete the file. The parameter path should point the file
   * inside the base storage.
   * 
   * E.g.: Storage: '/abc'
   *       File to delete: '/abc/def/ghi.jpg'
   *       Paramter: 'def/ghi.jpg'
   * 
   * @public
   * 
   * @param {string} path The path to the file that should be deleted
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {RequiredConfigParameterNotSetError}
   * @throws {StorageFileNotExistingError}
   * @throws {StorageFileNotDeletableError}
   * @throws {Error}
   */
  public async deleteFile(path: string): Promise<void> {
    this.logger.log('Check if file exists on the filesystem', 'debug');
    
    const baseStorage = await this.getBaseStorage();
    if (!baseStorage) {
      const error = new RequiredConfigParameterNotSetError(this.baseStorageKey, 'Storage must be defined to delete file');
      this.logger.log('To delete file, the storage must be defined', 'error');
      this.logger.log(error.stack, 'error');

      throw error;
    }
    
    const file = baseStorage + '/' + path;

    // Check if file exists in the storage
    // If file, which should be deleted, is not available a error is thrown
    try {
      const exists = await fs.stat(file);
    } catch (err) {
      this.logger.log('File to delete, does not exist on the filesystem', 'debug');

      const error = new StorageFileNotExistingError(file, 'File not existsing');
      this.logger.log(error.stack, 'warn');
      throw error;
    }


    try {
      this.logger.log(`Now try to delete the file ${file} from the storage`, 'debug');
      await fs.unlink(file);
    } catch (err) {
      this.logger.log(err.stack, 'error');
      const error = new StorageFileNotDeletableError(file, 'File could not be deleted');
      throw error;
    }

    this.logger.log(`${file} deleted from the file system`, 'debug');
  }
  
  /**
   * Checks, if a file on the filesystem exists.
   * Returns a boolean value, if the file is existing in the storage
   * 
   * @public
   * 
   * @param {string} path The path to the file or directory, which should be checked
   * 
   * @throws {RequiredConfigParameterNotSetError}
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async exists(path: string): Promise<boolean> {
    const baseStorage = await this.getBaseStorage();
    if (!baseStorage) {
      const error = new RequiredConfigParameterNotSetError(this.baseStorageKey, 'Storage not defined');
      this.logger.log(error.stack, 'error');

      throw error;
    }
    
    const fullPath = baseStorage + '/' + path;
    
    try {
      await fs.stat(fullPath);
      this.logger.log(`${fullPath} exists on the filesystem`, 'debug');
      return true;
    } catch (err) {
      this.logger.log(`${fullPath} does not exist on the filesystem`, 'debug');
      return false;
    }
  }


}
