/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which shows, that a user not existing
 * in the database. That error can for example be used
 * to show, that a user, who tries to login, uses a mail
 * address, that is not be registered.
 * 
 * @extends Error
 */

export class UserNotExistsError extends Error {

  /**
   * @property
   * @public
   * 
   * The mail address of the user, that could not
   * be found in the database
   */
  public mail: string;

  constructor(mail: string, msg?: string) {
    super(msg);

    this.mail = mail;
  }
}
