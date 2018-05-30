import { BaseError } from '../BaseError';

/**
 * @class
 * @author
 * 
 * Custom error, which should be used, when required fields for
 * objects in the database are not set.
 * The error contains a paramter, which should set to the name
 * of the required field, that is not defined.
 * 
 * @extends BaseError
 */

export class RequiredParameterNotSet extends BaseError {

  /**
   * @public
   * @property
   * 
   * The name of the field, that is missing to save or
   * update the object in the database.
   */
  public parameter: string;


  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Creates a new custom error
   * 
   * Constructor is extends to set the name of the missed
   * parameter.
   * 
   * @param {string} missedParameter The name of the missed parameter
   * @param {string} msg The error message (optional)
   */
  constructor(missedParameter: string, msg?: string) {
    super(400, msg);
    this.parameter = missedParameter;
  }
}
