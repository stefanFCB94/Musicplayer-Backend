import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error to show, that the configuration file
 * could not be found.
 * 
 * @extends BaseError
 */
export class ConfigFileNotFoundError extends BaseError {
  
  constructor(msg?: string) {
    super(500, msg);
  }
}
