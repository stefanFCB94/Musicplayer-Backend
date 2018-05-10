import 'reflect-metadata';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ILogger } from '../interfaces/ILogger';
import { IConfigService, IConfigServiceProvider } from '../interfaces/IConfigService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';


@injectable()
export class Logger implements ILogger {

  private configService: IConfigService;

  private keyLogLevel = 'LOGGER.LEVEL';
  private keyLogDirectory = 'LOGGER.DIRECTORY';
  private keyFilename = 'LOGGER.FILENAME';
  private keySingleFile = 'LOGGER.SINGLE_FILE';
  private keyConsole = 'LOGGER.CONSOLE';
  private keyRotationFile = 'LOGGER.ROTATION_FILE';


  private logLevel = 'warning';
  private logDirectory = '.';
  private filename = 'musicserver';

  private useSingleFile = false;
  private useDailyRotationFile = true;
  private useConsole = true;
  

  constructor(
    @inject(TYPES.ConfigServiceProvider) private configProvider: IConfigServiceProvider,
  ) {}

  private async init() {
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

  private readConfig() {
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


  private buildTransportDailyRotation() {
    return new winston.transports.DailyRotateFile({
      filename: `${this.filename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      dirname: this.logDirectory,
    });
  }

  private buildTransportSingleFile() {
    return new winston.transports.File({
      filename: `${this.filename}.log`,
      dirname: this.logDirectory,
    });
  }

  private buildTransportConsole() {
    return new winston.transports.Console({
      colorize: 'all',
    });
  }


  async log(msg: string, level = this.logLevel) {
    await this.init();
    winston.log(level, msg);
  }
}
