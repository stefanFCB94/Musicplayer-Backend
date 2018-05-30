/**
 * @class
 * @author Stefan Läufle
 * 
 * The base error, from which all custom errors should
 * extend.
 * 
 * The custom error extends the javascript error
 * with a code, which expresses a http error code
 */

export class BaseError extends Error {
  /**
   * @property
   * @type number
   * 
   * The HTTP code, which that error expresses
   */
  public code: number;

  constructor(code: number, msg?: string) {
    super(msg);

    this.code = code;
  }
}
