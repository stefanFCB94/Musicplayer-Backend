import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * a file in the directory, which should be saved their,
 * could not be found
 * 
 * @extends BaseError
 */
export class StorageFileNotExistingError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The file, which doesn't exist in the filesystem
   */
  public file: string;

  constructor(file: string, msg?: string) {
    super(500, msg);

    this.file = file;
  }
}
