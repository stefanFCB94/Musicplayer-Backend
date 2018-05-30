import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be called, if the configuration
 * is not loaded form the file into the service, but that would
 * be required
 * 
 * @extends BaseError
 */

export class ConfigNotLoadedError extends BaseError {

  constructor(msg?: string) {
    super(500, msg);
  }
}
