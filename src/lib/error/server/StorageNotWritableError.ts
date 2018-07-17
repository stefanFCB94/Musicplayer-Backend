import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * the path, which is configured as base storage,
 * is not be writable by the application
 * 
 * @extends BaseError
 */
export class StorageNotWritableError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The path, which isn't writable on the system
   */
  public path: string;

  constructor(path: string, msg?: string) {
    super(500, msg);

    this.path = path;
  }
}
