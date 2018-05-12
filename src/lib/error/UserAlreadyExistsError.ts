/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error for the case, that a user already
 * exists and can not be created
 * 
 * @extends Error
 */
export class UserAlreadyExistsError extends Error {

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Creates the error instance
   * 
   * @param {string} message The message of the error
   */
  constructor(message?: string) {
    super(message);
  }
}
