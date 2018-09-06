import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A error, which should be thrown, if it is tried
 * to save a image format, which is not supported 
 * by the service * 
 */

export class UnsupportedImageFormatError extends BaseError {

    /**
   * @property
   * @type string
   * 
   * The image format, which is not supported
   */
  private format: string;

  constructor(format: string, msg?: string) {
    super(400, msg);

    this.format = format;
  }
}
