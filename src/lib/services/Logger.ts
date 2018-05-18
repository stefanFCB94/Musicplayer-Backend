import 'reflect-metadata';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ILogger } from '../interfaces/services/ILogger';
import { IConfigService, IConfigServiceProvider } from '../interfaces/services/IConfigService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Logging service, which should be instanciated in singelton
 * scope, to prevent multiple open file handles.
 * 
 * The service uses the winston library for the logging utils.
 * The service must be fully initialized and the uses a single
 * log method.
 * 
 * @requires winston
 * @requires IConfigServiceProvider
 */

@injectable()
export class Logger implements ILogger {

  private configService: IConfigService;

  private keyLogLevel = 'LOGGER.LEVEL';
  private keyLogDirectory = 'LOGGER.DIRECTORY';
  private keyFilename = 'LOGGER.FILENAME';
  private keySingleFile = 'LOGGER.SINGLE_FILE';
  private keyConsole = 'LOGGER.CONSOLE';
  private keyRotationFile = 'LOGGER.ROTATION_FILE';


  private logLevel = 'warn';
  private logDirectory = '.';
  private filename = 'musicserver';

  private useSingleFile = false;
  private useDailyRotationFile = true;
  private useConsole = true;
  

  constructor(
    @inject(TYPES.ConfigServiceProvider) private configProvider: IConfigServiceProvider,
  ) {}

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the logger instance.
   * 
   * The method initialize the configuration service, creates
   * all winston transports and configure the winston unit.
   * 
   * @returns {Promise<void>} Resolves, when the logger is fully initialized
   */
  private async init(): Promise<void> {
    if (this.configService) { return Promise.resolve(); }
    this.configService = await this.configProvider();

    // Initalize logger
    this.readConfig();

    const transports = [];

    if (this.useSingleFile) {
      transports.push(this.buildTransportSingleFile());
    }

    if (this.useDailyRotationFile) {
      transports.push(this.buildTransportDailyRotation());
    }

    if (this.useConsole) {
      transports.push(this.buildTransportConsole());
    }

    winston.configure({
      transports,
      level: this.logLevel,
    });
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Read all the configuration parameters, which are relevant for
   * the logging service from the configuration file.
   * 
   * The method uses the configuration service, which should be
   * registered in the instance. All the detected parameters
   * are stored in the instance.
   * 
   * @returns {void} Doesn't return a value
   */
  private readConfig(): void {
    this.logLevel = this.configService.get(this.keyLogLevel) || this.logLevel;
    this.logDirectory = this.configService.get(this.keyLogDirectory) || this.logDirectory;
    this.filename = this.configService.get(this.keyFilename) || this.filename;

    if (this.configService.isSet(this.keySingleFile)) {
      this.useSingleFile = this.configService.get(this.keySingleFile);
    }

    if (this.configService.isSet(this.keyConsole)) {
      this.useConsole = this.configService.get(this.keyConsole);
    }

    if (this.configService.isSet(this.keyRotationFile)) {
      this.useDailyRotationFile = this.configService.get(this.keyRotationFile);
    }
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
   */
  private buildTransportDailyRotation(): winston.DailyRotateFileTransportInstance {
    return new winston.transports.DailyRotateFile({
      filename: `${this.filename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      dirname: this.logDirectory,
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
   * @returns {winston.FileTransportInstance} The created transport instance
   */
  private buildTransportSingleFile(): winston.FileTransportInstance {
    return new winston.transports.File({
      filename: `${this.filename}.log`,
      dirname: this.logDirectory,
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
   * @returns {winston.ConsoleTransportInstance} The created transport instance
   */
  private buildTransportConsole(): winston.ConsoleTransportInstance {
    return new winston.transports.Console({
      colorize: 'all',
    });
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Writes the log message to the configured transport units.
   * The method only writes the messages having at least the level
   * as the configured log level.
   * 
   * @param {string} msg   The message, which should be logged
   * @param {string} level The level the message has
   * 
   * @returns {Promise<void>} Resolve the proimse, when the message is logged
   */
  async log(msg: string, level: string = this.logLevel): Promise<void> {
    await this.init();
    winston.log(level, msg);
  }
}
