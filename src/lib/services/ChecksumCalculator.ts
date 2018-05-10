import 'reflect-metadata';
import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import { injectable, inject } from 'inversify';
import { IChecksumCalculator } from '../interfaces/IChecksumCalculator';
import { ILogger } from '../interfaces/ILogger';
import { TYPES } from '../types';


@injectable()
export class ChecksumCalculator implements IChecksumCalculator {

  @inject(TYPES.Logger)
  private logger: ILogger;


  private readFileFromBuffer(path: string) {
    this.logger.log(`Read file ${path} from filesystem into buffer`, 'debug');
    return fs.readFile(path);
  }

  async getMD5Checksum(file: Buffer|string) {
    this.logger.log('Start calculating MD5 checksum', 'debug');
    
    try {
      let buffer: Buffer;
      if (typeof file === 'string') {
        this.logger.log(`Read MD5 checksum from file ${file}`, 'debug');
        buffer = await this.readFileFromBuffer(file);
      } else {
        this.logger.log('Read MD5 checksum from buffer', 'debug');
        buffer = file;
      }

      const md5 = crypto.createHash('md5').update(buffer).digest('hex');
      this.logger.log(`Checksum calculated, Result: ${md5}`, 'debug');

      return Promise.resolve(md5);
    } catch (e) {
      this.logger.log('Error by calculation checksum', 'debug');
      this.logger.log(e, 'error');

      return Promise.reject(e);
    }
  }
}
