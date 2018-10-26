import * as fs from 'fs-extra';

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

import { BaseSystemPreferenceService } from '../../base/BaseSystemPreferenceService';
import { ILibraryReaderService } from '../../interfaces/services/ILibraryReaderService';


import { ILibraryFileDAO } from '../../interfaces/dao/ILibraryFileDAO';
import { ISystemPreferencesService } from '../../interfaces/services/ISystemPreferencesService';

import { LibraryPreferencesEnum } from '../../enums/preferences/LibraryPreferencesEnum';

import { LibraryPathNotExistingError } from '../../error/library/LibraryPathNotExistingError';
import { LibraryPathNotADirectoryError } from '../../error/library/LibraryPathNotADirectoryError';
import { LibraryPathNotReadableError } from '../../error/library/LibraryPathNotReadableError';
import { LibraryPathNotConfiguredError } from '../../error/library/LibraryPathNotConfiguredError';
import { LibraryPathAlreadyConfiguredError } from '../../error/library/LibraryPathAlreadyConfiguredError';
import { SupportedMimeTypeAlreadyConfiguredError } from '../../error/library/SupportedMimeTypeAlreadyConfiguredError';
import { SupportedMimeTypeNotConfiguredError } from '../../error/library/SupportedMimeTypeNotConfiguredError';


@injectable()
export class LibraryReaderService extends BaseSystemPreferenceService implements ILibraryReaderService {
  

  constructor(
    @inject(TYPES.SystemPreferencesService) systemPreferenceService: ISystemPreferencesService,
    @inject(TYPES.LibraryFileDAO) private libraryFileDAO: ILibraryFileDAO,
  ) {
    super(systemPreferenceService);

    this.systemPreferenceService.setDefaultValue(LibraryPreferencesEnum.MIME_TYPES, ['audio/mp3', 'audio/mp4', 'audio/x-flac', 'audio/x-m4a', 'audio/x-aac']);
  }


  /**
   * @private
   * @async
   * 
   * Checks, if a library path exists on the file system.
   * Returns the stats of the path, if it is found, otherwise
   * throws an error
   * 
   * @param {string} path The library path to check
   * 
   * @returns {Promise<fs.Stats>} The stats of the found path
   * 
   * @throws {LibraryPathNotExistingError}
   * @throws {Error}
   */
  private async libraryPathExists(path: string): Promise<fs.Stats> {
    let stats;

    try {
      stats = await fs.stat(path);
    } catch (err) {
      this.logger.warn(err);

      const error = new LibraryPathNotExistingError(path, 'Library path does not exist');
      this.logger.warn(error);
      throw error;
    }

    return stats;
  }

  /**
   * @private
   * 
   * Checks, if a path is a directory from the stats, which should
   * have been requested before.
   * 
   * Throws an error, if the path stats does not indicate a directory
   * 
   * @param {fs.Stats} stats The stats to check for
   * 
   * @returns {boolean} true If the path is a directory, otherwise throw an error
   * 
   * @throws {LibraryPathNotADirectoryError}
   * @throws {Error}
   */
  private isLibraryPathADirectory(stats: fs.Stats, path: string): boolean {
    if (!stats.isDirectory()) {
      const error = new LibraryPathNotADirectoryError(path, 'Library path is not a directory');
      this.logger.warn(error);
      throw error;
    }

    return true;
  }

  /**
   * @private
   * @async
   * 
   * Checks, if a library path is readable for the application6.
   * Works not on windows operation systems. On Windows systems
   * that check will be skipped an always true returned.
   * 
   * If library path is not readable, a custom error will be thrown.
   * 
   * @param {string} path The library path to check
   * 
   * @returns {Promise<boolean>} Returns true, or throws an error
   * 
   * @throws {LibraryPathNotReadableError}
   * @throws {Error}
   */
  private async isLibraryPathReadable(path: string): Promise<boolean> {
    if (process.platform !== 'win32') {
      const hasRead = await fs.access(path, fs.constants.R_OK);

      if (!hasRead) {
        const error = new LibraryPathNotReadableError(path, 'Library path is not readable');
        this.logger.warn(error);
        throw error;
      }
    }

    return true;
  }


  /**
   * @private
   * 
   * Check, if a path is a vlid library path for the application.
   * 
   * Checks, if the path is available on the system, if the path
   * is a directory and if the path is readable for the application
   * process.
   * 
   * @param {string} path The path to check if valid
   * 
   * @returns {Promise<boolean>} true If the path is valid, otherwise throw error
   * 
   * @throws {LibraryPathNotExistingError}
   * @throws {LibraryPathNotADirectoryError}
   * @throws {LibraryPathNotReadableError}
   * @throws {Error}
   */
  private async isLibraryPathValid(path: string): Promise<boolean> {
    this.logger.debug(`Check if path '${path}' is a valid path on the system`);

    const stats = await this.libraryPathExists(path);
    this.logger.debug(`'${path}' is existing on the filesystem. Now check, if path is a directory`);

    this.isLibraryPathADirectory(stats, path);
    this.logger.debug(`'${path}' is a valid directory. Now check, if the application can read the directory`);

    await this.isLibraryPathReadable(path);
    this.logger.debug('Library path is readable');
    
    return true;
  }



  /**
   * @public
   * @async
   * 
   * Get the configured library paths
   * 
   * @returns {Promise<string[]>} The configured paths
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLibraryPaths(): Promise<string[]> {
    const paths = this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.PATHS);
    
    this.logger.debug('Library paths successfully requestes from the system preference servcie');
    return paths;
  }

  /**
   * @public
   * @async
   * 
   * Set the library paths, which should be used to search for
   * valid media files.
   * 
   * The method overwrites existing library paths and will replace
   * these with only the paths, which are set in the first argument
   * 
   * @param {string[]} path The new library paths
   * 
   * @returns {Promise<void>}
   * 
   * @throws {LibraryPathNotExistingError}
   * @throws {LibraryPathNotADirectoryError}
   * @throws {LibraryPathNotReadableError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setLibraryPaths(paths: string[]): Promise<void> {
    this.logger.debug('Library paths should be set');
    this.logger.debug(`It should be set ${paths.length} library paths`);

    this.logger.debug('First remove possible duplicated entries');
    const uniquePaths = paths.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    this.logger.debug('Check, if each of the paths is existing');
    uniquePaths.forEach(async (path) => {
      await this.isLibraryPathValid(path);
    });

    this.logger.debug('All library paths are valid');
    this.logger.debug('Now add the library paths to the system preferences');

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.PATHS, uniquePaths);
  }

  /**
   * @public
   * @async
   * 
   * Adds a new path to the already configured paths.
   * The existing paths will not be touched.
   * 
   * @param {string} path The new path, that should be added
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {LibraryPathNotExistingError}
   * @throws {LibraryPathNotADirectoryError}
   * @throws {LibraryPathNotReadableError}
   * @throws {LibraryPathAlreadyConfiguredError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {InvalidConfigValueError}
   * @throws {RequiredParameterNotSet}
   * @throws {Error}
   * @
   */
  public async addLibraryPath(path: string): Promise<void> {
    this.logger.debug(`Try to add the path '${path}' as library path to the existing paths`);

    await this.isLibraryPathValid(path);
    this.logger.debug('New library path is valid');

    const paths = await this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.PATHS);
    
    if (paths.indexOf(path) !== -1) {
      this.logger.debug(`Library path '${path}' already defined`);
      
      const error = new LibraryPathAlreadyConfiguredError(path, 'Library path already exists');
      this.logger.warn(error);
      throw error;
    }

    paths.push(path);

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.PATHS, paths);
    this.logger.debug('Library path successfully added');
  }

  /**
   * @public
   * @async
   * 
   * Removes a library path from the application throgh
   * the  system preference service.
   * 
   * If the path was not configured before a custom error
   * will be thrown.
   * 
   * @param {string} path the library path, which should be removed
   * 
   * @returns {Promise<void>}
   * 
   * @throws {LibraryPathNotConfiguredError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {InvalidConfigValueError}
   * @throws {RequiredParameterNotSet}
   * @throws {Error}
   */
  public async removeLibraryPath(path: string): Promise<void> {
    this.logger.debug(`Try to delete library path '${path}' from the configuration`);
    const paths = await this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.PATHS);

    this.logger.debug('Check, if path is set in the preferences');
    if (paths.indexOf(path) === -1) {
      this.logger.debug(`Library path '${path}' is not configured`);

      const error = new LibraryPathNotConfiguredError(path, 'Library path not configured');
      this.logger.warn(error);
      throw error;
    }

    this.logger.debug(`Library path '${path}' was configured, so now delete that path`);
    const newPaths = paths.filter(p => p !== path);

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.PATHS, newPaths);
    this.logger.debug(`Library path '${path}' successfully deleted`);
  }



  /**
   * @public
   * @async
   * 
   * Get the mime types, which are supported by the library reader.
   * Files with other mime types are not supported and will not be added
   * to the application.
   * 
   * @returns {Promise<string>} The configured mime types
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getSupportedMimeTypes(): Promise<string[]> {
    this.logger.debug('Get the configured supported mime types for the library files');

    const mimeTypes = await this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.MIME_TYPES);
    this.logger.debug(`Supported mime types successfully requested, in total ${mimeTypes.length} configured`);

    return mimeTypes;
  }

  /**
   * @public
   * @async
   * 
   * Set the supported mime types for the library reader of the
   * application server.
   * 
   * The method will overwirte every mime types that are configured
   * before.
   * 
   * @param {stirng[]} types The new suppoted mime types
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {InvalidConfigValueError}
   * @throws {RequiredParameterNotSet}
   * @throws {ParameterOutOfBoundsError}
   * @throws {Error}
   */
  public async setSupportedMimeTypes(types: string[]): Promise<void> {
    this.logger.debug(`Set the ${types.length} mime types as supported mime types`);

    this.logger.debug('First remove possible duplicated entries');
    const uniqueTypes = types.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.MIME_TYPES, uniqueTypes);
    this.logger.debug('Supported mime types successfully set');
  }

  /**
   * @public
   * @async
   * 
   * Add a supported mime type to the configured values.
   * 
   * Method checks, if value is alfready defined. In that
   * case an error is thrown.
   * 
   * @param {string} type The mime type to add
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {SupportedMimeTypeAlreadyConfiguredError}
   * @throws {InvalidConfigValueError}
   * @throws {RequiredParameterNotSet}
   * @throws {ParameterOutOfBoundsError}
   * @throws {Error}
   */
  public async addSupportedMimeType(type: string): Promise<void> {
    this.logger.debug(`Try to add mime type '${type}' to the supported mime types`);

    const types = await this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.MIME_TYPES);
    this.logger.debug('Already defined mime types successfully requested');

    if (types.indexOf(type) !== -1) {
      this.logger.debug('Mime type to add already defined');

      const error = new SupportedMimeTypeAlreadyConfiguredError(type, 'Mime type already defined');
      this.logger.warn(error);
      throw error;
    }

    this.logger.debug('Mime type not defined previously, so add mime type');
    types.push(type);

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.MIME_TYPES, types);
    this.logger.debug(`Mime type '${type}' successfully added`);
  }

  /**
   * @public
   * @async
   * 
   * Reomve a mime type from the supported mime types.
   * 
   * The method tries to delete the mime type from the values
   * of the system prefrence service. If value is not configured
   * an error is thrown.
   * 
   * @param {string} type The mime type to be delete
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {SupportedMimeTypeNotConfiguredError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {InvalidConfigValueError}
   * @throws {RequiredParameterNotSet}
   * @throws {Error}
   */
  public async removeSupportedMimeType(type: string): Promise<void> {
    this.logger.debug(`Remove mime type '${type}' form the configured preference values`);

    const values = await this.systemPreferenceService.getPreferenceValues(LibraryPreferencesEnum.MIME_TYPES);
    this.logger.debug('CUrrently configured values read successfully from the preference service');

    if (values.indexOf(type) === -1) {
      this.logger.debug(`Mime type '${type}' cannot be removed, because it is not configured`);

      const error = new SupportedMimeTypeNotConfiguredError(type, 'Mime type not configured');
      this.logger.warn(error);
      throw error;
    }

    this.logger.debug('Mime type is at the moment configure, so remove it');
    const newTypes = values.filter(value => value !== type);

    await this.systemPreferenceService.savePreference(LibraryPreferencesEnum.MIME_TYPES, newTypes);
    this.logger.debug(`Mime type '${type}' successfully removed from the configured values`);
  }


}
