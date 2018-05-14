import 'reflect-metadata';
import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import { injectable, inject } from 'inversify';
import { IChecksumCalculator } from '../interfaces/IChecksumCalculator';
import { ILogger } from '../interfaces/ILogger';
import { TYPES } from '../types';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A service, that has routines for the calculation of 
 * checksum, which can be used to compare files and
 * changes of files.
 * 
 * The most used routine is the calculation of a MD5
 * checksum from a file
 * 
 * @requires fs-extra
 * @requires crypto
 * @requires ILogger
 */

@injectable()
export class ChecksumCalculator implements IChecksumCalculator {

  @inject(TYPES.Logger)
  private logger: ILogger;


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Read a file in the RAM from the file system.
   * 
   * The parameter should be the path, from where the
   * file should be read as buffer. The method returns
   * the loaded buffer.
   * 
   * @param {string} path The file
   * @returns {Promise<Buffer>}
   * 
   * @throws {Error} If a error occurs
   */
  private readFileFromBuffer(path: string): Promise<Buffer> {
    this.logger.log(`Read file ${path} from filesystem into buffer`, 'debug');
    return fs.readFile(path);
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Calculate the checksum (MD5 format) of a specific file.
   * 
   * The file can be calculated from a buffer or a string.
   * If a string is passed to the method, the file will
   * be read to a buffer and calculated afterwards.
   * 
   * The checksum could be used to detect changes on files.
   * 
   * @param {Buffer|string} file The file
   * @returns {Promise<string>} The calculated checksum
   * 
   * @throws {Error} If a error occurs by calculated the checksum
   */
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

      return md5;
    } catch (e) {
      this.logger.log('Error by calculation checksum', 'debug');
      this.logger.log(e.stack, 'error');

      return Promise.reject(e);
    }
  }
}
