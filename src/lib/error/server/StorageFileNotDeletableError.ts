import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * a file could not be deleted from the storage
 * 
 * @extends BaseError
 */
export class StorageFileNotDeletableError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The file, which could not be deleted from the storage
   */
  public file: string;

  constructor(file: string, msg?: string) {
    super(500, msg);

    this.file = file;
  }
}
