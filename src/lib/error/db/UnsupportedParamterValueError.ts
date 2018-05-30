import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which shows, that a database value
 * tried to be set with a unsupported value
 * 
 * @extends BaseError
 */

export class UnsupportedParamterValueError extends BaseError {

  /**
   * @public
   * @property
   * @type {string}
   * 
   * The name of the parameter, which should be set
   * with a unsupported value
   */
  public parameter: string;

  /**
   * @public
   * @property
   * @type {string}
   * 
   * The unsupported value, that was tried to be set
   */
  public value: string;


  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Creates the custom error.
   * Extends the error constructor by the parameter name
   * and the unsupported value
   * 
   * @param {string} paramter The name of the parameter
   * @param {any} value The unsupported value
   * @param {string} msg The error message (optional)
   */
  constructor(parameter: string, value: any, msg?: string) {
    super(400, msg);

    this.parameter = parameter;
    this.value = value;
  }
}
