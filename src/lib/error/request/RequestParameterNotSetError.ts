/**
 * @class
 * @author Stefan Läufle
 * 
 * A error, which should be thrown, if a request parameter
 * is not set. If the user makes a request to the api and
 * a required paramter is not set, that error should be
 * created and thrown
 * 
 * @extends Error
 */

export class RequestParameterNotSetError extends Error {
  
  /**
   * @property
   * @type string
   * 
   * The name of the request paramter, that is not set
   */
  public parameter: string;

  constructor(parameter: string, msg?: string) {
    super(msg);

    this.parameter = parameter;
  }
}
