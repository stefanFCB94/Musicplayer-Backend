import { injectable, inject } from 'inversify';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { TYPES } from '../types';
import { ILogger } from '../interfaces/ILogger';
import * as bcrypt from 'bcrypt';
import { IConfigServiceProvider, IConfigService } from '../interfaces/IConfigService';


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
 */

@injectable()
export class PasswordHasher implements IPasswordHasher {

  private configService: IConfigService;
  private saltRounds = 10;

  private roundsKey = 'SECURITY.SALT_ROUNDS';


  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) private configProvider: IConfigServiceProvider,
  ) {}


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the config service for the password hasher.
   * 
   * Step is required to make sure the configuration is completely loaded and parsed.
   * All methods, which are using the configuration service, should call first this
   * method, to make sure the required keys are loaded already.
   * 
   * @returns {Promise<void>} Returns, when the service is fully initialized
   * 
   * @throws {Error} If the service could not be established correct
   */
  private async initConfigService(): Promise<void> {
    if (this.configService) { return Promise.resolve(); }

    // ConfigService is not used before
    // So make sure it is initalized and the config is loaded
    this.logger.log('Start initialize the configuration service for the password hasher', 'debug');

    try {
      this.configService = await this.configProvider();

      // tslint:disable-next-line:max-line-length
      this.logger.log('Finished to initialize the configuration service for password hasher', 'debug');
      return Promise.resolve();
    } catch (err) {
      this.logger.log('Configuration service could not be initialized', 'debug');
      return Promise.reject(err);
    }
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

    await this.initConfigService();
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
