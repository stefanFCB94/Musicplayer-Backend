import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown if a value for the
 * parameter is not unique, although the database configuration
 * is said, that it must be unique.
 * 
 * @extends BaseError
 */

export class NotAUniqueValueError extends BaseError {

  /**
   * @public
   * @property
   * 
   * The name of the parameter, that has not a unique value
   */
  public parameter: string;

  /**
   * @public
   * @property
   * 
   * The value, that is not unique
   */
  public value: string;

  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Creates a new custom error, which extends the
   * error constructor, by the name of the parameter
   * and value, that is not unique
   * 
   * @param {string} parameter The name of the parameter, which is not unique
   * @param {any} value The value, which is not unique
   * @param {string} msg The error message (optional)
   */
  constructor(parameter: string, value: any, msg?: string) {
    super(400, msg);
    this.parameter = parameter;
    this.value = value;
  }
}
