import * as fs from 'fs-extra';
import { IConfigService } from '../interfaces/IConfigService';
import { injectable } from 'inversify';
import { ConfigFileNotFoundError } from '../error/ConfigFileNotFoundError';
import { ConfigFileNotReadableError } from '../error/ConfigFileNotReadableError';
import { ConfigNotLoadedError } from '../error/ConfigNotLoadedError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Service, to load the central configuration for the whole application
 * for the configuration file and present methods to check and load
 * configuration settings for other services.
 * 
 * Each other service, that depend on configuration parameters should
 * inject the configuration service to gain access to these parameters.
 * 
 * Service fist must load the configuration from the config file, before
 * the configuration could be served. These is happening in the best
 * case through a provider in the centralized container. Make sure, that
 * the service configuration instance is instanziated as singleton class,
 * otherwise the configuraton will be loaded on every request new.
 * 
 * Configuration is loaded by default from the 'config' directory of 
 * the root application directory. The selected configuration file is
 * picked by the NODE_ENV variable. Further information are present in
 * the application documentation
 * 
 * @requires fs-extra
 */

@injectable()
export class ConfigService implements IConfigService {

  private config: any;
  private defaultPath = './config/';

  /**
   * @public 
   * @author Stefan Läufle
   * 
   * Load the configuration from the config file an store the
   * configuration in the instance.
   * 
   * You can define the loaded config file, through the parameters,
   * where you can define a filename, which is loaded from the 
   * default config directory, or through the specific file
   * paramter, where you can define a file from a custom path
   * 
   * @param env  The name of the file in the config directory (default: production)
   * @param file The custom config file (optional)
   * 
   * @returns {Promise<void>} Resovles true when the config is fully loaded
   * 
   * @throws {ConfigFileNotFoundError} If the configuration file could not be found
   * @throws {ConfigFileNotReadableError} It the config file could not be read
   * @throws {Error} If a error happens
   */
  loadConfig(env: string = 'production', file?: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      let configFile = file;
    
      if (!configFile) {
        configFile = `${this.defaultPath}${env}.json`;
      }
  

      // Check, if configuration file exists
      try {
        const stats = await fs.stat(configFile);
        if (!stats.isFile()) {
          return reject(new Error('Path to configuration file is a directory'));
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          const error = new ConfigFileNotFoundError('Configuration file not found');
          return reject(error);
        }

        return reject(err);
      }

      // Check config file could be read
      try {
        const readable = await fs.access(configFile, fs.constants.R_OK);
      } catch (err) {
        const error = new ConfigFileNotReadableError('Config file could not be read');
        return reject(error);
      }
      
      try {
        const file = await fs.readFile(configFile);
        const config = JSON.parse(file.toString());
  
        this.config = config;
        return resolve();
      } catch (err) {
        return reject(err);
      }  
    });
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the value for a specific configuration key.
   * 
   * The key can be requested in dot syntax (e.g. 'KEY.KEY2.KEY3').
   * The value of the loaded configuration will be returned.
   * 
   * The configuration must be loaded before from the method
   * be called.
   *  
   * @param {string} key The configuration key, which should be loaded
   * @returns {any} The configuration value 
   * 
   * @throws {Error} If a error occurs
   */
  get(key: string): any {
    if (!this.config) {
      throw new ConfigNotLoadedError('Configuration not loaded into the config service');
    }

    if (!key) {
      throw new Error('Key must be given');
    }

    function reducer(obj: any, index: string) {
      if (obj && typeof obj[index] !== 'undefined') { return obj[index]; }
      return undefined;
    }


    return key.split('.').reduce(reducer, this.config);
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set the value for a specific key in the loaded configuration.
   * 
   * The key must be given in dot notation (e.g. 'KEY.KEY2.KEY3').
   * The value can be of everey data type.
   * 
   * If the key is already set, the value will be overwriten.
   * If the key is not set, the structure will be created and the
   * value set.
   * 
   * @param {string} key The key to set in dot notation
   * @param {any} data   The value to be set for the configuration file
   * 
   * @returns {void}
   * 
   * @throws {Error} If a error occurs
   */
  set(key: string, data: any): void {
    if (!key) {
      throw new Error('Key must be set');
    }

    this.config = this.config || {};
    let ref = this.config;

    const keys = key.split('.');
    keys.forEach((key, index) => {
      if (typeof ref[key] === 'undefined' && typeof keys[index + 1] !== 'undefined') { 
        ref[key] = {};
      }
      
      if (typeof keys[index + 1] === 'undefined') {
        ref[key] = data;
      }

      ref = ref[key];
    });
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Test if a specific key is set in the loaded configuration.
   * The key must be given in dot notation (e.g. 'KEY.KEY2.KEY3')
   * 
   * @param {string} key The key, that should be checked
   * @returns {boolean}
   */
  isSet(key: string): boolean {
    if (typeof this.get(key) === 'undefined') { return false; }
    return true;
  }
}
