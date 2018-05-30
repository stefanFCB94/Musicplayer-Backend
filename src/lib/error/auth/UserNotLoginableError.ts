import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which shows, that a login if for
 * a specific user is not possible, because he so
 * configured in the database
 * 
 * @extends BaseError
 */

export class UserNotLoginableError extends BaseError {

  constructor(msg?: string) {
    super(400, msg);
  }
}
