import { BaseError } from '../BaseError';

/**
 * @class
 * 
 * Custom error, which indicates that a specific library path
 * is not configured in the system preferences.
 * 
 * @extends BaseError
 */
export class LibraryPathNotConfiguredError extends BaseError {

  private path: string;

  constructor(path: string, msg?: string) {
    super(404, msg);
    this.path = path;
  }
}
