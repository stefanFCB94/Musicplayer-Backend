import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * a path in the base storage could not be created
 * 
 * @extends BaseError
 */
export class StoragePathNotCreatableError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The path, which isn't createable on the system
   */
  public path: string;

  constructor(path: string, msg?: string) {
    super(500, msg);

    this.path = path;
  }
}
