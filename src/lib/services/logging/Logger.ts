import 'reflect-metadata';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs-extra';

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';

import { BaseSystemPreferenceService } from '../../base/BaseSystemPreferenceService';
import { ILogger } from '../../interfaces/services/ILogger';
import { ISystemPreferencesService } from '../../interfaces/services/ISystemPreferencesService';

import { LogDirectoryNotAvailableError } from '../../error/utils/LogDirectoryNotAvailableError';
import { LogDirectoryNotWritableError } from '../../error/utils/LogDirectoryNotWritableError';

import { LogLevel } from '../../enums/LogLevel';
import { EventEmitter } from 'events';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Logger, which can be used to log messages to the configured
 * transports channels.
 * 
 * The service uses the events API to send the messages, which
 * should be logged. A listener will pick up the messages
 * and will write them to the configured channels
 * 
 * @requires events
 */

@injectable()
export class Logger implements ILogger {

  private eventEmitter: EventEmitter;

  constructor(
    @inject(TYPES.LoggerEventEmitter) eventEmitter: EventEmitter,
  ) {
    this.eventEmitter = eventEmitter;
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Emmits a log event, which couls be read be the loggingListenerService.
   * The listener will then wirte the log to the configured channels.
   * 
   * @param {string|Error} msg   The message, which should be logged
   * @param {string}       level The level the message has
   * 
   * @returns {Promise<void>} Resolve the proimse, when the message is logged
   */
  private async log(msg: string | Error, level: LogLevel): Promise<void> {
    this.eventEmitter.emit('log', { msg, level });
  }



  /**
   * @public
   * 
   * Log a message with the log level error
   * 
   * @param {string|Error} msg The log level
   * @return {Promise<void>}
   */
  public async error(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.ERROR);
  }

  /**
   * @public
   * 
   * Logs a message with warn level
   * 
   * @param {string|Error} msg The message or error to log
   * @returns {Promis<void>}
   */
  public async warn(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.WARN);
  }

  /**
   * @public
   * 
   * Logs a message or an error with info level
   * 
   * @param {string|Error} msg The message or error to log
   * @returns {Promise<void>}
   */
  public async info(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.INFO);
  }

  /**
   * @public
   * 
   * Logs a message or a error with verbose level
   * 
   * @param {string|Error} msg The message or error to log
   * @returns {Promise<void>}
   */
  public async verbose(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.VERBOSE);
  }

  /**
   * @public
   * 
   * Logs a meesage or error with debug level
   * 
   * @param {string|Error} msg The message or error to log
   * @returns {Promise<void>}
   */
  public async debug(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.DEBUG);
  }

  /**
   * @public
   * 
   * Logs a message or an error with silly level
   * 
   * @param {string|Error} msg The message or error to log
   * @returns {Promise<void>}
   */
  public async silly(msg: string | Error): Promise<void> {
    await this.log(msg, LogLevel.SILLY);
  }
}
