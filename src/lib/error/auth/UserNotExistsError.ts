import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which shows, that a user not existing
 * in the database. That error can for example be used
 * to show, that a user, who tries to login, uses a mail
 * address, that is not be registered.
 * 
 * @extends BaseError
 */

export class UserNotExistsError extends BaseError {

  /**
   * @property
   * @public
   * 
   * The mail address of the user, that could not
   * be found in the database
   */
  public mail: string;


  /**
   * @property
   * @public
   * 
   * The id of the user, that could not be found
   * in the database
   */
  public id: string;

  constructor(mail?: string, id?: string, msg?: string) {
    super(404, msg);

    this.mail = mail;
    this.id = id;
  }
}
