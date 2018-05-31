import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if the
 * private key for the HTTPS error could not be
 * found.
 * 
 * @extends BaseError
 */
export class PrivateKeyNotFoundError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The private key file, which could not be found
   */
  public key: string;

  constructor(key: string, msg?: string) {
    super(500, msg);

    this.key = key;
  }
}
