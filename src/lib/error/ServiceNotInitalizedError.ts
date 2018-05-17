/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which indicates, that a service
 * is not fully initialized for the required
 * operation.
 * 
 * @extends Error
 */

export class ServiceNotInitializedError extends Error {

  /**
   * @public
   * @property
   * @type {string}
   * 
   * The name of the service, which is not fully initialized
   */
  public service: string;


  /**
   * @constructor
   * @author Stefan Läufle
   * 
   * Constructs the custom error.
   * Extends the standard error, by the name of the
   * service, that is not fully initialized
   * 
   * @param {string} service The name of the service
   * @param {string} msg The error message (optional) 
   */
  constructor(service: string, msg?: string) {
    super(msg);

    this.service = service;
  }
}
