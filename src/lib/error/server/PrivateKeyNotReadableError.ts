import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * the private key file could not be read, because
 * of missing permissions to the file
 * 
 * @extends BaseError
 */
export class PrivateKeyNotReadableError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The file, which can not be read
   */
  public key: string;

  constructor(key: string, msg?: string) {
    super(500, msg);

    this.key = key;
  }
}
