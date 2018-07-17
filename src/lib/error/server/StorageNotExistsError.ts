import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * the path, which is configured as base storage,
 * is not be found on the filesystem
 * 
 * @extends BaseError
 */
export class StorageNotExistsError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The path, which doesn't exist on the system
   */
  public path: string;

  constructor(path: string, msg?: string) {
    super(500, msg);

    this.path = path;
  }
}
