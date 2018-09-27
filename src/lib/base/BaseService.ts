import { ILogger } from '../interfaces/services/ILogger';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { container } from '../inversify.config';


/**
 * @class
 * @author Stefan Läufle
 * 
 * A base service, each service should inherit from.
 * The service has a logger instance configured.
 */

@injectable()
export class BaseService {

  /**
   * @property
   * @type ILogger
   * 
   * Each base service should has logger instance.
   * This is the injected logger instance
   */
  @inject(TYPES.Logger)
  protected logger: ILogger;
  
}
