import { BaseError } from '../BaseError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown,
 * if it is tried to save an invalid configuration value
 * to the database.
 * 
 * @extends BaseError
 */
export class InvalidConfigValueError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The prefrence key, to which the value is
   * tried to be saved
   */
  private preference: string;


  /**
   * @property
   * @type string
   * 
   * The invalid value
   */
  private invalidValue: string;

  constructor(preference: string, invalidValue: any, msg?: string) {
    super(400, msg);

    this.preference = preference;
    this.invalidValue = invalidValue;
  }
}
