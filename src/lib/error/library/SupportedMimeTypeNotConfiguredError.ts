import { BaseError } from '../BaseError';


/**
 * @class
 * 
 * A custom error, which is thrown, when a supported mime
 * type value of the library readed could not be found.
 * 
 * @extends BaseError
 */
export class SupportedMimeTypeNotConfiguredError extends BaseError {

  private mimeType: string;

  constructor(mimeType: string, msg?: string) {
    super(404, msg);
    this.mimeType = mimeType;
  }
}
