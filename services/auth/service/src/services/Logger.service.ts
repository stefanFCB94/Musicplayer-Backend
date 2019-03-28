import * as config from 'config';
import * as axios from 'axios';
import { LogLevel } from '../enums/LogLevel';


interface LogPostBody {
  service: string;
  request: string;
  message: string;
  level: LogLevel;
}


export class Logger {

  private url: string;
  private serviceName: string;

  constructor() {
    const useHttps: boolean = config.get('USE_HTTPS') || false;
    const schema = useHttps ? 'https' : 'http';
    const port = useHttps ? 443 : 80;

    const host = config.get('LOGGER.HOST') || 'logger';

    this.url = `${schema}://${host}:${port}/v1`;
    this.serviceName = config.get('AUTH.SERVICE_NAME') || 'auth';

    process.on('unhandledRejection', async (err) => {
      await this.log('__UNHANDLED__', err.message, LogLevel.ERROR);
      await this.log('__UNHANDLED__', err.stack, LogLevel.ERROR);
    });

    process.on('uncaughtException', async (err) => {
      await this.log('__UNHANDLED__', err.message, LogLevel.ERROR);
      await this.log('__UNHANDLED__', err.stack, LogLevel.ERROR);
    });
  }


  public async log(request: string, message: string, level: LogLevel) {
    const body: LogPostBody = {
      request,
      message,
      level,
      service: this.serviceName,
    };

    try {
      await axios.default.post(`${this.url}/logs`, body);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  public async closeServiceLogFile() {
    try {
      await axios.default.delete(`${this.url}/service/${this.serviceName}/logger`);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

}
