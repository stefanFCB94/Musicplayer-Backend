import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * the path to the private key is not a file, 
 * but a directory
 * 
 * @extends BaseError
 */
export class PrivateKeyNotAFileError extends BaseError {

  /**
   * @property
   * @type stirng
   * 
   * The path, which is not file but
   * a directory
   */
  public key: string;

  constructor(key: string, msg?: string) {
    super(500, msg);

    this.key = key;
  }
}
