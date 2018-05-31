import * as jsonwebtoken from 'jsonwebtoken';

import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

import { BaseConfigService } from '../base/BaseConfigService';
import { IJWTGenerator, JWTPayload } from '../interfaces/services/IJWTGenerator';

import { IConfigServiceProvider } from '../interfaces/services/IConfigService';
import { LocalUser } from '../db/models/LocalUser';
import { ILogger } from '../interfaces/services/ILogger';

import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';
import { RequestParameterNotSetError } from '../error/request/RequestParameterNotSetError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A singleton service to create, verify and parse
 * JSON web tokens used for authentification.
 * 
 * The service should be used to create a JWT from
 * as user object of the verify that a passed JWT
 * is valid.
 * 
 * @extends BaseConfigService
 */

@injectable()
export class JWTGenerator extends BaseConfigService implements IJWTGenerator {

  private serviceInitialized = false;

  private algorithm: string = 'HS256';
  private expiresIn: string = '30d';
  private secretKey: string = '549r<*?G{PdUjLF~';

  private algorithmKey: string = 'SECURITY.JWT.ALGORITHM';
  private expiresInKey: string = 'SECURITY.JWT.EXPIRES';
  private secretPassphraseKey: string = 'SECURITY.JWT.SECRET';

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
   * Initialize the JWT generator and read all the
   * required values from the config service.
   * 
   * Read all the configuration keys from the config
   * service and set these values in the jwt generator.
   * If config values are not set, the default values
   * be used.
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   */
  private async init(): Promise<void> {
    if (this.serviceInitialized) { return; }

    await this.initConfigService();

    const algorithm = this.configService.get(this.algorithmKey);
    if (algorithm && typeof algorithm === 'string') {
      this.algorithm = algorithm;
    }

    const expires = this.configService.get(this.expiresInKey);
    if (expires && typeof expires === 'string') {
      this.expiresIn = expires;
    }

    const secret = this.configService.get(this.secretPassphraseKey);
    if (secret && typeof secret === 'string') {
      this.secretKey = secret;
    }
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Generate the jwt payload from the local user data.
   * 
   * @param {LocalUser} user The local user data
   */
  generateJWTPayload(user: LocalUser): JWTPayload {
    return {
      mail: user.mail,
      userId: user.id,
    } as JWTPayload;
  }

  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Generate a jwt with the generated payload, which is
   * valid encrypted with the secret key and the algorithm
   * configured in the jwt generator or the config file.
   * 
   * The JWT will expire after the time period, which is
   * configured in the jwt generator or the config file.
   * 
   * @param {LocalUser} user The user information for the JWT payload
   * 
   * @returns {Promise<string>} Returns the generated jwt
   * 
   * @throws {Error} If a error occurs by jwt generation
   * @throws {RequestParameterNotSetError} If user ist not given as parameter
   */
  async generateJWT(user: LocalUser): Promise<string> {
    await this.init();

    if (!user || !user.mail || !user.id) {
      const error = new RequestParameterNotSetError('user', 'User msut be given to generate new jwt');
      this.logger.log(error.stack, 'error');

      throw error;
    }
    
    return new Promise<string>((resolve, reject) => {
      const payload = this.generateJWTPayload(user);

      this.logger.log('Create jsonwebtoken', 'debug');
      jsonwebtoken.sign(payload, this.secretKey, { algorithm: this.algorithm, expiresIn: this.expiresIn }, (err, jwt) => {
        if (err) {
          this.logger.log(err.stack, 'error');
          throw err;
        }

        this.logger.log(`Jwonwebtoken generated: ${jwt}`, 'debug');
        resolve(jwt);
      });
    });
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Verify if a jwt is vaild. The method will return
   * a the undecoded jwt payload or will throw a error
   * if the jwt is not valid
   * 
   * @param {string} jwt The jwt to test
   * 
   * @returns {Promise<JWTPayload>} The decoded jwt payload
   * 
   * @throws {JsonWebTokenError}
   * @throws {NotBeforeError}
   * @throws {TokenExpiredError}
   */
  async verifyJWT(jwt: string): Promise<JWTPayload> {
    await this.init();

    this.logger.log('Start verifing jsonwebtoken', 'debug');
    return new Promise<JWTPayload>((resolve, reject) => {
      jsonwebtoken.verify(jwt, this.secretKey, { algorithms: [this.algorithm] }, (err, payload: JWTPayload) => {
        if (err) {
          this.logger.log('JWT is not valid', 'debug');
          this.logger.log(err.stack, 'warn');
          throw err;
        }

        this.logger.log('Jsonwebtoken is valid', 'debug');
        resolve(payload);
      });
    });
  }
}
