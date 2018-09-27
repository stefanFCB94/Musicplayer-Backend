import { Connection, createConnection } from 'typeorm';

import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

import { BaseConfigService } from '../base/BaseConfigService';
import { IDatabaseService } from '../interfaces/db/IDatabaseService';

import { ILogger } from '../interfaces/services/ILogger';
import { IConfigServiceProvider } from '../interfaces/services/IConfigService';

import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';
import { RequiredConfigParameterNotSetError } from '../error/config/RequiredConfigParamterNotSetError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Central service to handle the connection to the database.
 * Service should be instantiated as singleton for the complete application,
 * to prefend the behavior, that for every request a new connection to the
 * database will be created.
 * 
 * Class includes methods to handle the connection to the database, including
 * the storing of already established connections.
 * 
 * @requires ILogger
 * @requires IConfigServiceProvider
 * 
 * @extends BaseConfigService
 */

@injectable()
export class DatabaseService extends BaseConfigService implements IDatabaseService {

  private connection: Connection;

  private typeKey = 'DATABASE.TYPE';
  private hostKey = 'DATABASE.HOST';
  private portKey = 'DATABASE.PORT';
  private usernameKey = 'DATABASE.USERNAME';
  private passwordKey = 'DATABASE.PASSWORD';
  private databaseKey = 'DATABASE.DATABASE';

  constructor(
    @inject(TYPES.ConfigServiceProvider) configProvider: IConfigServiceProvider,
  ) {
    super(configProvider);
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Central method to establish a new connection to the database or get a
   * already established connection.
   * 
   * If in the database service a connection is already saved, these already
   * existing connection will be used.
   * 
   * If no connection is already established it will create a new connection
   * and store these connection in the database service for further usage.
   * 
   * The new connection will be established with the parameters from the
   * config service for the database. It requires these parameters otherwise
   * it will throw a error.
   * 
   * @returns {Promise<Connection>} The opened connection to the database
   * 
   * @throws {Error} If the connection to the database could not be established
   * @throws {RequiredConfigParameterNotSetError} If not all parameter for the genration
   *            of a new database connection are configured in the config file
   */
  async getConnection(): Promise<Connection> {
    if (this.connection && this.connection.isConnected) { 
      return this.connection;
    }

    // Initialize the config service if neccassary
    await this.initConfigService();

    let error: RequiredConfigParameterNotSetError;

    if (!this.configService.isSet(this.typeKey)) {
      error = new RequiredConfigParameterNotSetError(this.typeKey, 'No database type configured');
    }

    if (!this.configService.isSet(this.hostKey)) {
      error = new RequiredConfigParameterNotSetError(this.hostKey, 'No database host configured');
    }

    if (!this.configService.isSet(this.portKey)) {
      error = new RequiredConfigParameterNotSetError(this.portKey, 'No database port configured');
    }

    if (!this.configService.isSet(this.usernameKey)) {
      // tslint:disable-next-line:max-line-length
      error = new RequiredConfigParameterNotSetError(this.usernameKey, 'No username for database connection configured');
    }

    if (!this.configService.isSet(this.passwordKey)) {
      // tslint:disable-next-line:max-line-length
      error = new RequiredConfigParameterNotSetError(this.passwordKey, 'No password for database connection configured');
    }

    if (!this.configService.isSet(this.databaseKey)) {
      // tslint:disable-next-line:max-line-length
      error = new RequiredConfigParameterNotSetError(this.databaseKey, 'No name for the target database configured');
    }

    // If a error on the checks appeared, it will not be tried to establish
    // a database connection
    if (error) {
      this.logger.debug('Database connection cannot be established');
      this.logger.error(error);

      return Promise.reject(error);
    }

    try {
      this.connection = await createConnection({
        type: this.configService.get(this.typeKey),
        host: this.configService.get(this.hostKey),
        port: this.configService.get(this.portKey),
        username: this.configService.get(this.usernameKey),
        password: this.configService.get(this.passwordKey),
        database: this.configService.get(this.databaseKey),
        entities: [
          __dirname + '/models/*.js',
        ],
        synchronize: true,
      });

      this.logger.info('Connection to database established');
      return this.connection;
    } catch (e) {
      this.logger.error('Connection to the database could not be established');
      this.logger.error(e);
      return Promise.reject(e);
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Should close all database connections, which are stored in the current
   * instance of the database serivce.
   * 
   * If a connection is open to the database, these connection will be closed
   * and the reference to the connection will be removed from the instance.
   * 
   * If no database connection is open, the method will not do anything.
   * 
   * @returns {Promise<void>} Will resolve, when all connections to the database
   *                          are closed
   * 
   * @throws {Error} Will be thrown, when a error on closing the database
   *                 connection occurs
   */
  async closeConnection(): Promise<void> {
    this.logger.debug('Database connection is going to close');

    if (!this.connection) {
      this.logger.debug('Datebase connection was already closed');
      return;
    }

    if (!this.connection.isConnected) {
      this.logger.debug('Database connection was not connected anymore');
      this.connection = null;
      return;
    }

    try {
      await this.connection.close();

      this.logger.info('Datebase connection closed');
      this.connection = null;
      return;
    } catch (err) {
      this.logger.error('Error by closing the database connection');
      this.logger.error(err);
      return Promise.reject(err);
    }
  }
}
