import * as config from 'config';
import { Connection, createConnection } from 'typeorm';
import { Logger } from '../services/Logger.service';
import { LogLevel } from '../enums/LogLevel';


export class DatabaseService {


  private connection: Connection;
  private logger: Logger;


  constructor(logger: Logger) {
    this.logger = logger;
  }


  getConnection(): Connection {
    return this.connection;
  }


  async connect(): Promise<void> {

    const host: string = config.get('DB.HOST');
    const port: number = config.get('DB.PORT');

    const username: string = config.get('AUTH.DB.USERNAME');
    const password: string = config.get('AUTH.DB.PASSWORD');
    const database: string = config.get('AUTH.DB.DATABASE');

    try {

      const dir = __dirname;
      this.connection = await createConnection({
        host,
        port,
        username,
        password,
        database,
        type: 'postgres',
        entities: [
          `${dir}/models/*.js`,
        ],
        synchronize: true,
      });

      this.logger.log('__AUTH-START__', 'Connection to database successuflly established', LogLevel.INFO);
    } catch (error) {
      this.logger.log('__AUTH-START__', error.message, LogLevel.ERROR);
      this.logger.log('__AUTH-START__', error.stack, LogLevel.ERROR);

      process.kill(process.pid, 'SIGINT');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    await this.connection.close();
    this.connection = null;

    this.logger.log('__AUTH-STOP__', 'Connection to database successfully closed', LogLevel.INFO);
  }

}
