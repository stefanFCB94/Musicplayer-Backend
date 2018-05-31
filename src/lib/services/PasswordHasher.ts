import * as bcrypt from 'bcrypt';

import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

import { BaseConfigService } from '../base/BaseConfigService';
import { IPasswordHasher } from '../interfaces/services/IPasswordHasher';

import { ILogger } from '../interfaces/services/ILogger';
import { IConfigServiceProvider } from '../interfaces/services/IConfigService';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Service to manage passwords for the user accounts.
 * 
 * Serivce has functions to manage the special request, which are required by
 * the management of the senitiv data of passwords.
 * 
 * Service includes methods create a hash from a password in clear text and
 * to check if a password matches the saved hashed password.
 * 
 * @requires bcrypt
 * @requires ILogger
 * @requires IConfigServiceProvider
 * 
 * @extends BaseConfigService
 */

@injectable()
export class PasswordHasher extends BaseConfigService implements IPasswordHasher {

  private serviceInitialized = false;

  private saltRounds = 10;

  private roundsKey = 'SECURITY.SALT_ROUNDS';


  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) configProvider: IConfigServiceProvider,
  ) {
    super(logger, configProvider);
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the password hasher.
   * 
   * By the initialization of the service all the global configuration keys are
   * read from the config service after the service is initalized.
   * 
   * The possible config parameter are read from the config service and set to
   * instance for the next rounds
   * 
   * @returns {Promise<void>} Returns, when the service is fully initialized
   * 
   * @throws {ServiceNotInitializedError} If the config service could not be initialized
   */
  private async init(): Promise<void> {
    if (this.serviceInitialized) { return; }

    await this.initConfigService();

    const saltRounds = this.configService.get(this.roundsKey);
    if (saltRounds && typeof saltRounds === 'number') {
      this.saltRounds = saltRounds;
    }

    this.serviceInitialized = true;
  }

  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Create the password hash from the value in plane text.
   * 
   * The parameter will be hashed through the library bcrypt.
   * The hashing is generated with a salt, which is generated
   * in multiple rounds of the bcrypt library.
   * 
   * The number of rounds can be paramized in the configuration
   * file. The paramized value is requested through the configuration
   * service.
   * 
   * @param {string} pw The value, which should be hashed
   * @returns {Promise<string>} The hashed password
   */
  async hash(pw: string): Promise<string> {
    this.logger.log('Start hashing password', 'debug');

    await this.init();
    let rounds = this.saltRounds;

    if (this.configService.isSet(this.roundsKey)) {
      this.logger.log('Salt rounds will be extracted from the configuration file', 'debug');
      rounds = this.configService.get(this.roundsKey);
    }

    this.logger.log('Start generating salt', 'debug');
    const salt = await bcrypt.genSalt(rounds);

    this.logger.log('Salt generated. Start hashing', 'debug');
    const hash = await bcrypt.hash(pw, salt);

    this.logger.log('Hash generated', 'debug');
    return hash;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Method to compare a password in clear text and a hashed password.
   * 
   * Method should be used to compare a user input with the stored
   * password in the database. Method is neccassary, because hased passwords
   * could not be converted back.
   * 
   * @param {string} pw   The value, which should be compared to the hashed value 
   * @param {string} hash The hash, which should be compared to the user input
   * 
   * @returns {Promise<boolean>} The result, if the value matches the hashed value
   */
  async compare(pw: string, hash: string): Promise<boolean> {
    this.logger.log('Start comparing passwords', 'debug');

    const result = await bcrypt.compare(pw, hash);
    this.logger.log(`Password comparing finished. Result: ${result}`, 'debug');

    return result;
  }
}
