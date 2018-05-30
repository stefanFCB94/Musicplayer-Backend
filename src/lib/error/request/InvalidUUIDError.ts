import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if a
 * invalid UUID is passed to the api
 * 
 * @extends BaseError
 */

export class InvalidUUIDError extends BaseError {
  /**
   * @property
   * @type String
   * 
   * The invalid value, which was passed to the api
   */
  public invalidValue: string;

  constructor(invalidValue: string, msg?: string) {
    super(400, msg);

    this.invalidValue = invalidValue;
  }
}
