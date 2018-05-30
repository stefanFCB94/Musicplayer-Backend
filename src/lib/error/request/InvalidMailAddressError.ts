import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, when
 * an invalid mail address was detect, e.g in the
 * request of the api
 * 
 * @extends BaseError
 */

export class InvalidMailAddressError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The invalid value for the mail address
   */
  public invalidValue: string;

  constructor(value: string, msg?: string) {
    super(400, msg);

    this.invalidValue = this.invalidValue;
  }
}
