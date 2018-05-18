/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown if a parameter for
 * the parameter extends the length of the database field.
 * 
 * @extends Error
 */

export class ParameterOutOfBoundsError extends Error {

  /**
   * @public
   * @property
   * 
   * The name of the parameter, that is out of
   * bounds
   */
  public parameter: string;

  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Creates a new custom error, which extends the
   * error constructor, by the name of the parameter,
   * that is out of bounds.
   * 
   * @param {string} parameter The name of the parameter out of bounds
   * @param {string} msg The error message (optional)
   */
  constructor(parameter: string, msg?: string) {
    super(msg);
    this.parameter = parameter;
  }
}
