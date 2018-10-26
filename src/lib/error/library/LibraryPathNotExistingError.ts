import { BaseError } from '../BaseError';

/**
 * @class
 * 
 * Error, which will be thrown, if a library path is not existing
 * on the serer. This can be, if a new library path is added to 
 * thw  application or by reading the library
 * 
 * @extends BaseError
 */
export class LibraryPathNotExistingError extends BaseError {

  private path: string;

  constructor(path: string, msg?: string) {
    super(400, msg);
    this.path = path;
  }

}
