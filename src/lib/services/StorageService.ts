import * as fs from 'fs-extra';
import * as mkdirp from 'mkdirp';

import { IStorageService } from '../interfaces/services/IStorageService';
import { BaseConfigService } from '../base/BaseConfigService';

import { TYPES } from '../types';
import { inject } from 'inversify';

import { ILogger } from '../interfaces/services/ILogger';
import { IConfigServiceProvider } from '../interfaces/services/IConfigService';

import { RequiredConfigParameterNotSetError } from '../error/config/RequiredConfigParamterNotSetError';
import { StorageNotExistsError } from '../error/server/StorageNotExistsError';
import { StorageNotWritableError } from '../error/server/StorageNotWritableError';
import { StoragePathNotCreatableError } from '../error/server/StoragePathNotCreateableError';
import { StorageFileNotExistingError } from '../error/server/StorageFileNotExistingError';
import { StorageFileNotDeletableError } from '../error/server/StorageFileNotDeletableError';


export class StorageService extends BaseConfigService implements IStorageService {

  private serviceInitialized = false;


  private baseStorage: string;
  
  private baseStorageKey: string = 'STORAGE.PATH';


  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) configProvider: IConfigServiceProvider,
  ) {
    super(logger, configProvider);
  }

  /**
   * Initialize the storage service, so that it can be used.
   * Reads the path, where the files of the application should
   * be stored and checks, if that directory exists and can be
   * writen into.
   * 
   * @private
   * 
   * @throws RequiredConfigParameterNotSetError
   * @throws StorageNotExistsError
   * @throws StorageNotWritableError
   */
  private async init() {
    if (this.serviceInitialized) { return; }

    this.logger.log('Starting intialisation for the storage service', 'debug');
    await this.initConfigService();

    // Read the path of the base storage from the configuration file
    this.baseStorage = this.configService.get(this.baseStorageKey);
    if (!this.baseStorage || typeof this.baseStorage !== 'string') {
      const error = new RequiredConfigParameterNotSetError(this.baseStorageKey, 'Path to diretory, where to store files, must be set');
      this.logger.log(error.stack, 'error');
      throw error;
    }

    // Check if base storage exists in the file system
    const storageExists = await fs.pathExists(this.baseStorage);
    const stats = await fs.stat(this.baseStorage);
    if (!storageExists || stats.isFile()) {
      const error = new StorageNotExistsError(this.baseStorage, 'Path does not exists on the filesystem');
      this.logger.log(error.stack, 'error');
      throw error;
    }

    if (process.platform !== 'win32') {
      const hasWrite = await fs.access(this.baseStorage, fs.constants.W_OK);
      if (!hasWrite) {
        const error = new StorageNotWritableError(this.baseStorage, 'Path is not writable');
        this.logger.log(error.stack, 'error');
        throw error;
      }
    }

    this.logger.log('Storage service fully initialised', 'debug');
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
   */
  private async createSubdir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      mkdirp(path, (err) => {
        if (err) {
          this.logger.log(err.stack, 'error');
          return reject(err);
        }

        this.logger.log(`Path '${path}' created`, 'debug');
        resolve();
      });
    });
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
   * @throws RequiredConfigParameterNotSetError
   * @throws StorageNotExistsError
   * @throws StoragePathNotCreateableError
   * @throws StorageNotWritableError
   */
  async saveFile(path: string, filename: string, file: Buffer): Promise<string> {
    await this.init();

    const pathToSaveIn = this.baseStorage + '/' + path;
    const exists = await this.exists(path);

    if (!exists) {
      this.logger.log('Path has to be created', 'debug');
      try {
        await this.createSubdir(pathToSaveIn);
      } catch (err) {
        const error = new StoragePathNotCreatableError(pathToSaveIn, 'Path could not be created on the file system');
        this.logger.log(error.stack, 'error');
        throw error;
      }
    }

    if (process.platform !== 'win32') {
      const access = await fs.access(pathToSaveIn, fs.constants.W_OK);
      if (!access) {
        const error = new StorageNotWritableError(pathToSaveIn, 'In target directory cannot be writen');
        this.logger.log(error.stack, 'error');
        throw error;
      }
    }

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
   * The function deleted the file, which is based in a paramter from the storage.
   * The parameter should be point to the file, with the the full path without
   * the part of the storage.
   * 
   * E.g.: Storage: '/abc'
   *       File to delete: '/abc/def/ghi.jpg'
   *       Paramter: 'def/ghi.jpg'
   * 
   * @public
   * 
   * @param {string} path The full path to the file that should be deleted
   * @returns {Promise<void>}
   * 
   * @throws RequiredConfigParameterNotSetError
   * @throws StorageNotExistsError
   * @throws StorageNotWritableError
   * @throws StorageFileNotExistingError
   * @throws StorageFileNotDeletableError
   */
  async deleteFile(path: string): Promise<void> {
    await this.init();

    this.logger.log('Check if file exists on the filesystem', 'debug');
    const file = this.baseStorage + '/' + path;
    const exists = await this.exists(path);

    if (!exists) {
      const error = new StorageFileNotExistingError(file, 'File not existing');
      this.logger.log(error.stack, 'error');
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
   * @throws RequiredConfigParameterNotSetError
   * @throws StorageNotExistsError
   * @throws StorageNotWritableError 
   */
  async exists(path: string): Promise<boolean> {
    await this.init();
    
    this.logger.log(`Service fully initalised. Now check if file or directory exists`, 'debug');

    const fullPath = this.baseStorage + '/' + path;
    
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
