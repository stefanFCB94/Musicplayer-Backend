import { BaseService } from './BaseService';
import { IConfigService, IConfigServiceProvider } from '../interfaces/services/IConfigService';
import { ILogger } from '../interfaces/services/ILogger';
import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';
import { injectable } from 'inversify';


@injectable()
export class BaseConfigService extends BaseService {

  private configProvider: IConfigServiceProvider;
  protected configService: IConfigService;

  constructor(
    configProvider: IConfigServiceProvider,
  ) {
    super();

    this.configProvider = configProvider;
  }


   /**
   * @protected
   * @author Stefan Läufle
   * 
   * Initialize the config service for the base service.
   * 
   * Step is required to make sure the configuration is completely loaded and parsed.
   * All methods, which are using the configuration service, should call first this
   * method, to make sure the required keys are loaded already.
   * 
   * @returns {Promise<void>} Returns, when the service is fully initialized
   * 
   * @throws {ServiceNotInitializedError} If the service could not be established correct
   */
  protected async initConfigService(): Promise<void> {
    if (this.configService) { return; }

    // ConfigService is not used before
    // So make sure it is initalized and the config is loaded
    this.logger.debug('Start initialize the configuration service');

    try {
      this.configService = await this.configProvider();

      // tslint:disable-next-line:max-line-length
      this.logger.debug('Finished to initialize the configuration service');
      return;
    } catch (err) {
      this.logger.error(err);
      
      const error = new ServiceNotInitializedError('IConfigService', 'Config service could not be initalized');
      this.logger.error(error);

      throw error;
    }
  }

}
