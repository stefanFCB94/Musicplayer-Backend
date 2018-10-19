import { ILogger } from '../../lib/interfaces/services/ILogger';
import { injectable } from 'inversify';

@injectable()
export class LoggerMock implements ILogger {
  async error(msg: string | Error): Promise<void> {
  }

  async warn(msg: string | Error): Promise<void> {
  }
 
  async info(msg: string | Error): Promise<void> {
  }
 
  async verbose(msg: string | Error): Promise<void> {
  }
 
  async debug(msg: string | Error): Promise<void> {
  }
 
  async silly(msg: string | Error): Promise<void> {
  }
}
