import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A error, which should be thrown, if a request parameter
 * is not set. If the user makes a request to the api and
 * a required paramter is not set, that error should be
 * created and thrown
 * 
 * @extends BaseError
 */

export class RequestParameterNotSetError extends BaseError {
  
  /**
   * @property
   * @type string
   * 
   * The name of the request paramter, that is not set
   */
  public parameter: string;

  constructor(parameter: string, msg?: string) {
    super(400, msg);

    this.parameter = parameter;
  }
}
