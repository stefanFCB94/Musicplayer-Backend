import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error, which should be thrown, when the 
 * configuration file could not be read, because of
 * insufficient file permissions
 * 
 * @extends BaseError
 */

export class ConfigFileNotReadableError extends BaseError {

  constructor(msg?: string) {
    super(500, msg);
  }
}
