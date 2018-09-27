import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Error, which shows, that a directory, which should
 * be used as logging directory, is not writable by the
 * application
 * 
 * @extends BaseError
 */
export class LogDirectoryNotWritableError extends BaseError {

  directory: string;

  constructor(directory: string, msg?: string) {
    super(400, msg);

    this.directory = directory;
  }
}
