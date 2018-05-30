import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Creates a custom error, which shows the case, that a
 * required config parameter is not set in the configuration file
 * 
 * @extends BaseError
 */
export class InsufficientConfigParameterError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The name of the config parameter, which is not set
   * in the configuration file
   */
  public parameter: string;

  constructor(parameter: string, msg?: string) {
    super(500, msg);

    this.parameter = parameter;
  }
}
