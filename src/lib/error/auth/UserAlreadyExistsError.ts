import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error for the case, that a user already
 * exists and can not be created
 * 
 * @extends BaseError
 */
export class UserAlreadyExistsError extends BaseError {

  constructor(msg?: string) {
    super(422, msg);
  }
}
