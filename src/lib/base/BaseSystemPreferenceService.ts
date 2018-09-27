import { BaseService } from './BaseService';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';
import { ILogger } from '../interfaces/services/ILogger';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Base class, which initialize a logger and the system preference
 * service for a service.
 * 
 * @extends BaseService
 */
export class BaseSystemPreferenceService extends BaseService {

  protected systemPreferenceService: ISystemPreferencesService;

  constructor(systemPreferenceService: ISystemPreferencesService) {
    super();
    this.systemPreferenceService = systemPreferenceService;
  }

}
