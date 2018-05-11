import { Connection, createConnection } from 'typeorm';
import { inject } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../interfaces/ILogger';
import { IConfigService, IConfigServiceProvider } from '../interfaces/IConfigService';
import { IDatabaseService } from '../interfaces/IDatabaseService';


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


  private async initConfigService() {
    if (this.configService) { return; }

    this.configService = await this.configProvider();
    this.logger.log('Config-Service initialized for database service', 'debug');
    return;
  }


  async getConnection() {
    if (this.connection) { return this.connection; }

    // Initialize the config service if neccassary
    await this.initConfigService();

    if (!this.configService.isSet(this.typeKey)) {
      this.logger.log('Connection cannot be established. No database type configured', 'error');
      return Promise.reject(new Error('No database type configured'));
    }

    if (!this.configService.isSet(this.hostKey)) {
      this.logger.log('Connection cannot be established. No host configured', 'error');
      return Promise.reject(new Error('No host for database configured'));
    }

    if (!this.configService.isSet(this.portKey)) {
      this.logger.log('Connection cannot be established. No port configured', 'error');
      return Promise.reject(new Error('No port for database configured'));
    }

    if (!this.configService.isSet(this.usernameKey)) {
      this.logger.log('Connection cannot be established. No username configured', 'error');
      return Promise.reject(new Error('No username for database configured'));
    }

    if (!this.configService.isSet(this.passwordKey)) {
      this.logger.log('Connection cannot be established. No password configured', 'error');
      return Promise.reject(new Error('No password for database configured'));
    }

    if (!this.configService.isSet(this.databaseKey)) {
      this.logger.log('Connection cannot be established. No database name configured', 'error');
      return Promise.reject(new Error('No database name configured'));
    }

    try {
      this.connection = await createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'total90',
        database: 'musicserver',
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
}
