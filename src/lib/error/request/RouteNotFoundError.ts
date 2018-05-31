import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown, if
 * a route could not be found on the server
 * 
 * @extends BaseError
 */
export class RouteNotFoundError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The route, which could not be found
   */
  public route: string;

  /**
   * @property
   * @type string;
   * 
   * The used HTTP method to access the route,
   * which could not be found
   */
  public method: string;

  constructor(route: string, method: string, msg?: string) {
    super(404, msg);

    this.route = route;
    this.method = method;
  }
}
