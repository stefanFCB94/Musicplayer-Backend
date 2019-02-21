import * as config from 'config';
import { Connection, createConnection } from 'typeorm';



export class DatabaseService {

  private connection: Connection;


  getConnection(): Connection {
    return this.connection;
  }


  async connect(): Promise<void> {
    
    const host: string = config.get('DB.HOST');
    const port: number = config.get('DB.PORT');

    const username: string = config.get('LOGGER.DB.USERNAME');
    const password: string = config.get('LOGGER.DB.PASSWORD');
    const database: string = config.get('LOGGER.DB.DATABASE');

    try {
      
      this.connection = await createConnection({
        host,
        port,
        username,
        password,
        database,
        type: 'postgres',
        entities: [
          __dirname + '/models/*.js',
        ],
        synchronize: true,
      });

    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    await this.connection.close();
    this.connection = null;
  }

}
