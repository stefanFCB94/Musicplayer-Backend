import { BaseError } from '../BaseError';


/**
 * @class
 * 
 * A custom error, which shows, that a library directory could
 * not be read by the application. Error can be thrown, when it
 * is tried to add a new library path or if it is tried to read
 * in a library path.
 * 
 * @extends BaseError
 */
export class LibraryPathNotReadableError extends BaseError {

  private path: string;

  constructor(path: string, msg?: string) {
    super(400, msg);
    this.path = path;
  }
}
