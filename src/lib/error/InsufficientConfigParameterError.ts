/**
 * @class
 * @author Stefan Läufle
 * 
 * Creates a custom error, which shows the case, that a
 * required config parameter is not set in the configuration file
 */
export class InsufficientConfigParameterError extends Error {

  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Creates a new instance of the error
   * 
   * @param {string} message The error message
   */
  constructor(message?: string) {
    super(message);
  }
}
