import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error, which should be used, when the password
 * form the request not matches the saved password in
 * the database.
 * 
 * @extends BaseError
 */

export class PasswordNotMatchError extends BaseError {

  constructor(msg?: string) {
    super(400, msg);
  }
}
