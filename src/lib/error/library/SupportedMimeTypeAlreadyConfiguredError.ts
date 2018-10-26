import { BaseError } from '../BaseError';


/**
 * @class
 * 
 * A cusotm error, which is thrown, when a user tries to add
 * new supported mime type for the library reader, but that
 * mime type is already defined.
 * 
 * @extends BaseError
 */
export class SupportedMimeTypeAlreadyConfiguredError extends BaseError {

  private mimeType: string;
  
  constructor(mimeType: string, msg?: string) {
    super(400, msg);
    this.mimeType = mimeType;
  }
}
