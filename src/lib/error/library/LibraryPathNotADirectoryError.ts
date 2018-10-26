import { BaseError } from '../BaseError';

/**
 * @class
 * 
 * A custom error, which should be thrown, if a configured or passed
 * library path is not a directory. The system can only deal with directories
 * to read library files in.
 * 
 * Error could be thrown, if a new library path is added to the system or
 * when it is tried to read a already configured library path.
 * 
 * @extends BaseError
 */
export class LibraryPathNotADirectoryError extends BaseError {

  private path: string;

  constructor(path: string, msg?: string) {
    super(400, msg);
    this.path = path;
  }
}
