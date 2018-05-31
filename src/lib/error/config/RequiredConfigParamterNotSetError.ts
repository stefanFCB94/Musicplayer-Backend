import { BaseError } from '../BaseError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown,
 * if a required config paramter is not set.
 * 
 * @extends BaseError
 */
export class RequiredConfigParameterNotSetError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The config parameter, which is not set
   */
  private parameter: string;

  constructor(paramter: string, msg?: string) {
    super(500, msg);

    this.parameter = this.parameter;
  }
}
