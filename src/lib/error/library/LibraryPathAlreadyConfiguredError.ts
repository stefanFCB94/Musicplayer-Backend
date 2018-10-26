import { BaseError } from '../BaseError';


/**
 * @class
 * 
 * A custom error, which should be thrown if a library path was tried
 * to be added to the system, that is already defined.
 * 
 * @extends BaseError
 */
export class LibraryPathAlreadyConfiguredError extends BaseError {

  private path: string;

  constructor(path: string, msg?: string) {
    super(400, msg);
    this.path = path;
  }
}
