import { ILogger } from '../interfaces/services/ILogger';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A base service, each service should inherit from.
 * The service has a logger instance configured.
 */

export class BaseService {

  /**
   * @property
   * @type ILogger
   * 
   * Each base service should has logger instance.
   * This is the injected logger instance
   */
  protected logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }

}
