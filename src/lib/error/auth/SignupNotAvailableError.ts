import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if a user tries
 * to signup to the application, but that is function is
 * disabled in the configuraiton.
 * 
 * @extends BaseError
 */
export class SignupNotAvailableError extends BaseError {

  constructor(msg?: string) {
    super(400, 'Signup by user is not available');
  }
}
