import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A error, which should be thrown, if a error on
 * processing a image object is happening.
 * 
 */

export class ImageProcessingError extends BaseError {


  constructor(msg?: string) {
    super(500, msg);
  }
}
