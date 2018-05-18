import { Connection, createConnection } from 'typeorm';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../interfaces/services/ILogger';
import { IConfigService, IConfigServiceProvider } from '../interfaces/services/IConfigService';
import { IDatabaseService } from '../interfaces/db/IDatabaseService';
import { InsufficientConfigParameterError } from '../error/config/InsufficientConfigParameterError';
import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';

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
 */

@injectable()
export class DatabaseService implements IDatabaseService {

  private configService: IConfigService;
  private connection: Connection;

  private typeKey = 'DATABASE.TYPE';
  private hostKey = 'DATABASE.HOST';
  private portKey = 'DATABASE.PORT';
  private usernameKey = 'DATABASE.USERNAME';
  private passwordKey = 'DATABASE.PASSWORD';
  private databaseKey = 'DATABASE.DATABASE';

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) private configProvider: IConfigServiceProvider,
  ) {}


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Method to initialize all the configuration service.
   * Required to make sure, that all asynchronous task of the config service,
   * are finished before it will be used.
   * 
   * All methods of the class, which uses the config service, should first
   * call that method to make sure, the service is fully initialized.
   * 
   * @returns {Promise<void>} A resolved Promise, when the config service is
   *                          fully initialized
   */
  private async initConfigService(): Promise<void> {
    if (this.configService) { return; }

    try {
      this.configService = await this.configProvider();
      this.logger.log('Config-Service initialized for database service', 'debug');
      return;
    } catch (err) {
      this.logger.log('Config-Service could not be intitalized', 'debug');
      
      const error = new ServiceNotInitializedError('IConfigService', 'Serivce could not be intialized');
      this.logger.log(error.stack, 'error');
      throw error;
    }
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
   * @throws {InsufficientConfigParameterError} If not all parameter for the genration
   *            of a new database connection are configured in the config file
   */
  async getConnection(): Promise<Connection> {
    if (this.connection && this.connection.isConnected) { 
      return this.connection;
    }

    // Initialize the config service if neccassary
    await this.initConfigService();

    let error: InsufficientConfigParameterError;

    if (!this.configService.isSet(this.typeKey)) {
      error = new InsufficientConfigParameterError('No database type configured (DATABASE.TYPE)');
    }

    if (!this.configService.isSet(this.hostKey)) {
      error = new InsufficientConfigParameterError('No database host configured (DATABASE.HOST)');
    }

    if (!this.configService.isSet(this.portKey)) {
      error = new InsufficientConfigParameterError('No database port configured (DATABASE.PORT)');
    }

    if (!this.configService.isSet(this.usernameKey)) {
      // tslint:disable-next-line:max-line-length
      error = new InsufficientConfigParameterError('No username for database connection configured (DATABASE.USERNAME)');
    }

    if (!this.configService.isSet(this.passwordKey)) {
      // tslint:disable-next-line:max-line-length
      error = new InsufficientConfigParameterError('No password for database connection configured (DATABASE.PASSWORD)');
    }

    if (!this.configService.isSet(this.databaseKey)) {
      // tslint:disable-next-line:max-line-length
      error = new InsufficientConfigParameterError('No name for the target database configured (DATABASE.DATABASE)');
    }

    // If a error on the checks appeared, it will not be tried to establish
    // a database connection
    if (error) {
      this.logger.log('Database connection cannot be established', 'debug');
      this.logger.log(error.stack, 'error');

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

      this.logger.log('Connection to database established', 'info');
      return this.connection;
    } catch (e) {
      this.logger.log('Connection to the database could not be established', 'error');
      this.logger.log('Error:'  + e.toString(), 'error');
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
    this.logger.log('Database connection is going to close', 'debug');

    if (!this.connection) {
      this.logger.log('Datebase connection was already closed', 'debug');
      return;
    }

    if (!this.connection.isConnected) {
      this.logger.log('Database connection was not connected anymore', 'debug');
      this.connection = null;
      return;
    }

    try {
      await this.connection.close();

      this.logger.log('Datebase connection closed', 'info');
      this.connection = null;
      return;
    } catch (err) {
      this.logger.log('Error by closing the database connection', 'error');
      this.logger.log(err.stack, 'debug');
      return Promise.reject(err);
    }
  }
}
