import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs-extra';

import { EventEmitter } from 'events';

import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';

import { ISystemPreferencesService } from '../../interfaces/services/ISystemPreferencesService';
import { ILoggerListenerService } from '../../interfaces/services/ILoggerListenerService';

import { LogDirectoryNotAvailableError } from '../../error/utils/LogDirectoryNotAvailableError';
import { LogDirectoryNotWritableError } from '../../error/utils/LogDirectoryNotWritableError';

import { LogDataEvent } from '../../interfaces/models/LogDataEvent';
import { LogLevel } from '../../enums/LogLevel';


/**
 * @class
 * 
 * Service to listen to log events, which the service will then write
 * to the configured transport channels.
 * 
 * Through the service, the log parameter can be configured. The log
 * parameters will be stored in the database.
 * 
 * Service should not be injected into other services, but should be
 * instantiated at the start of the process.
 * 
 * @requires winston
 * @requires fs-extra
 * @requires events
 * @requires systemPreferencesService
 */

@injectable()
export class LoggerListenerService implements ILoggerListenerService {

  private initialized = false;

  private systemPreferenceService: ISystemPreferencesService;
  private loggerEventEmitter: EventEmitter;

  private keyLogLevel = 'LOGGER.LEVEL';
  private keyLogDirectory = 'LOGGER.DIRECTORY';
  private keyFilename = 'LOGGER.FILENAME';
  private keySingleFile = 'LOGGER.SINGLE_FILE';
  private keyConsole = 'LOGGER.CONSOLE';
  private keyRotationFile = 'LOGGER.ROTATION_FILE';


  constructor(
    @inject(TYPES.SystemPreferencesService) systemPreferenceService: ISystemPreferencesService,
    @inject(TYPES.LoggerEventEmitter) loggerEventEmitter: EventEmitter,
  ) {
    this.systemPreferenceService = systemPreferenceService;
    this.loggerEventEmitter = loggerEventEmitter;

    this.systemPreferenceService.setAllowedValues(this.keyLogLevel, [LogLevel.ERROR, LogLevel.INFO, LogLevel.INFO, LogLevel.VERBOSE, LogLevel.DEBUG, LogLevel.VERBOSE]);
    this.systemPreferenceService.setAllowedValues(this.keyConsole, [true, false]);
    this.systemPreferenceService.setAllowedValues(this.keyRotationFile, [true, false]);
    this.systemPreferenceService.setAllowedValues(this.keySingleFile, [true, false]);

    this.systemPreferenceService.setDefaultValue(this.keyLogLevel, ['warn']);
    this.systemPreferenceService.setDefaultValue(this.keyLogDirectory, ['.']);
    this.systemPreferenceService.setDefaultValue(this.keyFilename, ['musicserver']);
    this.systemPreferenceService.setDefaultValue(this.keyConsole, [true]);
    this.systemPreferenceService.setDefaultValue(this.keySingleFile, [false]);
    this.systemPreferenceService.setDefaultValue(this.keyRotationFile, [true]);
  }

  
  /**
   * @public
   * 
   * Get the current log level
   * 
   * @returns {Promise<string>} The current log level
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogLevel(): Promise<string> {
    const level = await this.systemPreferenceService.getPreferenceValues(this.keyLogLevel);

    if (level && level.length > 0) {
      return level[0];
    }

    return null;
  }

  /**
   * @public
   * 
   * Get the current log directory, where the log files
   * are stored
   * 
   * @returns {Promise<string>}  The current log directory
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogDirectory(): Promise<string> {
    const values = await this.systemPreferenceService.getPreferenceValues(this.keyLogDirectory);

    if (values && values.length > 0) {
      return values[0];
    }

    return null;
  }

  /**
   * @public
   * 
   * Get get name, which should be used as filename for
   * the log files
   * 
   * @returns {Promise<string>} The current filename
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogFilename(): Promise<string> {
    const values = await this.systemPreferenceService.getPreferenceValues(this.keyFilename);

    if (values && values.length > 0) {
      return values[0];
    }

    return null;
  }

  /**
   * @public
   * 
   * Get, if the logger should use a single file for logging
   * 
   * @returns {Promise<boolean>} If a single file should be used
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogUseSingleFile(): Promise<boolean> {
    const values = await this.systemPreferenceService.getPreferenceValues(this.keySingleFile);

    if (values && values.length > 0) {
      return values[0];
    }

    return null;
  }

  /**
   * @public
   * 
   * Get, if a daily rotation file should be used for logging
   * 
   * @returns {Promise<boolean>} If a daily rotation file is used for logging
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogUseDailyRotationFile(): Promise<boolean> {
    const values = await this.systemPreferenceService.getPreferenceValues(this.keyRotationFile);

    if (values && values.length > 0) {
      return values[0];
    }

    return null;
  }

  /**
   * @public
   * 
   * Get, if the logger should use the console for logging
   * 
   * @returns {Promise<boolean>} If the logger uses the console
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getLogUseConsole(): Promise<boolean> {
    const values = await this.systemPreferenceService.getPreferenceValues(this.keyConsole);

    if (values && values.length > 0) {
      return values[0];
    }

    return null;
  }

  
  /**
   * Set a new log level for the application
   * 
   * @param {LogLevel} logLevel The new log level, which should be used
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
  
   */
  public async setLogLevel(logLevel: LogLevel): Promise<void> {
    await this.systemPreferenceService.savePreference(this.keyLogLevel, [logLevel]);

    winston.configure({
      level: logLevel,
    });
  }

  /**
   * Set the a new directory, where the log files should be created in
   * 
   * @param {string} directory The new log directory
   * 
   * @throws {LogDirectoryNotAvailableError}
   * @throws {LogDirectoryNotWritableError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setLogDirectory(directory: string): Promise<void> {
    let stats;
    
    try {
      stats = await fs.stat(directory);
    } catch (err) {
      const error = new LogDirectoryNotAvailableError('Directory does not exist');
      throw error;
    }

    if (!stats.isDirectory()) {
      const error = new LogDirectoryNotWritableError('Cannot write to directory, because path is a file');
      throw error;
    }

    if (process.platform !== 'win32') {
      const hasWrite = await fs.access(directory, fs.constants.W_OK);
      
      if (!hasWrite) {
        const error = new LogDirectoryNotWritableError('Directory is not writable by service');
        throw error;
      }
    }

    await this.systemPreferenceService.savePreference(this.keyLogDirectory, [directory]);
  }

  /**
   * Set the name, which should be used as file name for the log files
   * 
   * @param {string} filename The filename
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setLogFilename(filename: string): Promise<void> {
    await this.systemPreferenceService.savePreference(this.keyFilename, [filename]);

    const transports = await this.getTransports();
    winston.configure({
      transports,
    });
  }

  /**
   * @public
   * 
   * Set, if logging should use a single file to log in
   * 
   * @param {boolean} useSingleFile If a single file should be used
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setLogUseSingleFile(useSingleFile: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(this.keySingleFile, [useSingleFile]);

    const transports = await this.getTransports();
    winston.configure({ transports });
  }

  /**
   * @public
   * 
   * Set, if a daily rotation file should be used for logging
   * 
   * @param {string} useDailyRotationFile If a daily rotation file should be used
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error} 
   */
  public async setLogUseDailyRotationFile(useDailyRotationFile: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(this.keyRotationFile, [useDailyRotationFile]);
    
    const transports = await this.getTransports();
    winston.configure({ transports });
  }

  /**
   * @public
   * 
   * Set, if logger should use the console for logging
   * 
   * @param {boolean} useConsole If console should be used
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setLogUseConsole(useConsole: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(this.keyConsole, [useConsole]);
    
    const transports = await this.getTransports();
    winston.configure({ transports });
  }



  /**
   * @public
   * 
   * Initalized the logging process, for the first use
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async init(): Promise<void> {
    if (this.initialized) { return; }

    const transports = await this.getTransports();
    const level = await this.getLogLevel();
    
    winston.configure({ transports, level });

    this.loggerEventEmitter.addListener('log', async (data: LogDataEvent) => {
      await this.log(data.msg, data.level);
    });
  }

  /**
   * @private
   * 
   * Get all transports, which should be used for the winston
   * logger. Used the configuration for evaluate, which loggings
   * should be used
   * 
   * @returns {Promise<any[]>} The transports to use for the winston library
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private async getTransports(): Promise<any[]> {
    const transports = [];

    const useConsole = await this.getLogUseConsole();
    if (useConsole) {
      transports.push(await this.buildTransportConsole());
    }

    const useSingleFile = await this.getLogUseSingleFile();
    if (useSingleFile) {
      transports.push(await this.buildTransportSingleFile());
    }

    const useDailyRotation = await this.getLogUseDailyRotationFile();
    if (useDailyRotation) {
      transports.push(await this.buildTransportDailyRotation());
    }

    return transports;
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Creates a transport unit for the winston logger library, which
   * uses a daily rotaiton file.
   * 
   * With the transport element the logs will be writen in files, which
   * are changing every day. It will generate a file with a daily timestamp.
   * 
   * @returns {winston.DailyRotateFileTransportInstance} The created transport instance
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private async buildTransportDailyRotation(): Promise<winston.DailyRotateFileTransportInstance> {
    const filename = await this.getLogFilename();
    const directory = await this.getLogDirectory();

    return new winston.transports.DailyRotateFile({
      filename: `${filename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      dirname: directory,
    });
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Creates a transport unit for the winston logger library, which
   * uses a single file for every log at any time.
   * 
   * With the transport element the logs will be writen in a single file.
   * All new logs will be append at the end of the file.
   * 
   * @returns {Promise<winston.FileTransportInstance>} The created transport instance
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private async buildTransportSingleFile(): Promise<winston.FileTransportInstance> {
    const filename = await this.getLogFilename();
    const directory = await this.getLogDirectory();
    
    return new winston.transports.File({
      filename: `${filename}.log`,
      dirname: directory,
    });
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Creates a transport unit for the winston logger library, which
   * uses the console for every log.
   * 
   * With the transport element, the logs will be writen to the console,
   * which started the application.
   * 
   * @returns {Promise<winston.ConsoleTransportInstance>} The created transport instance
   */
  private async buildTransportConsole(): Promise<winston.ConsoleTransportInstance> {
    return new winston.transports.Console({
      colorize: 'all',
    });
  }


   /**
   * @private
   * @author Stefan Läufle
   * 
   * Writes the log message to the configured transport units.
   * The method only writes the messages having at least the level
   * as the configured log level.
   * 
   * @param {string|Error} msg   The message, which should be logged
   * @param {string}       level The level the message has
   * 
   * @returns {Promise<void>} Resolve the proimse, when the message is logged
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private async log(msg: string | Error, level: LogLevel): Promise<void> {
    if (msg instanceof Error) {
      winston.log(level, `[${msg.name}] ${msg.message}`);
      winston.log(level, msg.stack);
    } else {
      winston.log(level, msg);
    }
  }

}
