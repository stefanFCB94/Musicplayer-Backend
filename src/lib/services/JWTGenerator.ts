import * as jsonwebtoken from 'jsonwebtoken';

import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

import { BaseSystemPreferenceService } from '../base/BaseSystemPreferenceService';
import { IJWTGenerator, JWTPayload } from '../interfaces/services/IJWTGenerator';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';

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
 * Service should also be used, if the configuration values
 * for, which are relevant for the genrating and verifiying
 * of the JWTs, should be changed.
 * 
 * @extends BaseSystemPreferenceService
 */

@injectable()
export class JWTGenerator extends BaseSystemPreferenceService implements IJWTGenerator {
  
  private algorithmDefault: string = 'HS256';
  private algorithmKey: string = 'SECURITY.JWT.ALGORITHM';
  private algorithmValues: string[] = ['HS256'];

  private expiresInDefault: string = '30d';
  private expiresInKey: string = 'SECURITY.JWT.EXPIRES';
  
  private secretKeyDefault: string = '549r<*?G{PdUjLF~';
  private secretPassphraseKey: string = 'SECURITY.JWT.SECRET';


  constructor(
    @inject(TYPES.SystemPreferencesService) systemPreferences: ISystemPreferencesService,
  ) {
    super(systemPreferences);

    this.init();
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the service by setting the configuration parameters
   * for using the system preference service. Function sets the allowed
   * values, the check functions and the default value.
   * 
   * @returns {void}
   */
  private init(): void {
    // Set allowed values for the specific system preferences
    this.systemPreferenceService.setAllowedValues(this.algorithmKey, this.algorithmValues);

    // Set check functions for specific system preferences
    this.systemPreferenceService.setCheckFunction(this.expiresInKey, this.isExpiresInValueValid);

    // Set default values for the specific system preferences
    this.systemPreferenceService.setDefaultValue(this.algorithmKey, [this.algorithmDefault]);
    this.systemPreferenceService.setDefaultValue(this.expiresInKey, [this.expiresInDefault]);
    this.systemPreferenceService.setDefaultValue(this.secretPassphraseKey, [this.secretKeyDefault]);
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Function, to check, if a value has the correct format to be
   * used as expired in value. The function has the format, that
   * is used by the system preference service.
   * 
   * @param {any} value The value to check
   * @returns {Promise<boolean>} The result of the check 
   */
  private isExpiresInValueValid(value: any): Promise<boolean> {
    if (!value) {
      return Promise.resolve(false);
    }
    
    if (typeof value !== 'string') {
      return Promise.resolve(false);
    }

    // Allowed format: 30d
    if (!/^\d+d$/.test(value)) {
      return Promise.reject(false);
    }

    return Promise.resolve(true);
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a new value for the algorithm, which is used to
   * encrypt the JWT.
   * 
   * @param {string} algorithm The algorithm to use
   * @returns {Promise<void>} 
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setAlgorithm(algorithm: string): Promise<void> {
    await this.systemPreferenceService.savePreference(this.algorithmKey, [algorithm]);
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a new value for the configuration, how long a configured
   * JWT should be valid.
   * 
   * Allowed format: 30d (Number of days)
   * 
   * @param {string} expiresIn The new configuration value
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}

   */
  public async setExpiresIn(expiresIn: string): Promise<void> {
    await this.systemPreferenceService.savePreference(this.expiresInKey, [expiresIn]);
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a new value for the secret key configuration, which is used
   * as secret key in the encryption of the JWT.
   * 
   * @param {string} secretKey The new secret key
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
 
   */
  public async setSecretKey(secretKey: string): Promise<void> {
    await this.systemPreferenceService.savePreference(this.secretPassphraseKey, [secretKey]);
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the current configuration value for the algorithm, with which
   * the JWT should be encrypted.
   * 
   * @returns {Promise<string>} The configuration value or null
   * 
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  public async getAlgorithm(): Promise<string> {
    const algorithm = await this.systemPreferenceService.getPreferenceValues(this.algorithmKey);
    
    if (!algorithm || algorithm.length === 0) {
      return null;
    }

    return algorithm[0];
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the current configuration value, how long a JWT should
   * be valid
   * 
   * @returns {Promise<string>} The current configuration value or null
   * 
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  public async getExpiresIn(): Promise<string> {
    const expiresIn = await this.systemPreferenceService.getPreferenceValues(this.expiresInKey);

    if (!expiresIn || expiresIn.length === 0) {
      return null;
    }

    return expiresIn[0];
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the current configuration value for the secret key, with which the
   * JWT should be encrypted
   * 
   * @returns {Promise<string} The configuration value or null
   * 
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  public async getSecretKey(): Promise<string> {
    const secretKey = await this.systemPreferenceService.getPreferenceValues(this.secretPassphraseKey);

    if (!secretKey || secretKey.length === 0) {
      return null;
    }

    return secretKey[0];
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Generate the jwt payload from the local user data.
   * 
   * @param {LocalUser} user The local user data
   */
  private generateJWTPayload(user: LocalUser): JWTPayload {
    return {
      mail: user.mail,
      userId: user.id,
    };
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
   * @throws {ServiceNotInitalizedError} If system prefernce service not fully initialized
   * @throws {RequestParameterNotSetError} If user ist not given as parameter
   */
  async generateJWT(user: LocalUser): Promise<string> {
    if (!user || !user.mail || !user.id) {
      const error = new RequestParameterNotSetError('user', 'User msut be given to generate new jwt');
      this.logger.error(error);

      throw error;
    }

    this.logger.debug('Get the required parameters to generate JWT from the configuration');
    const secretKey = await this.getSecretKey();
    const algorithm = await this.getAlgorithm();
    const expiresIn = await this.getExpiresIn();

    return new Promise<string>((resolve, reject) => {
      const payload = this.generateJWTPayload(user);

      this.logger.debug('Create new jsonwebtoken');
      jsonwebtoken.sign(payload, secretKey, { algorithm, expiresIn }, (err, jwt) => {
        if (err) {
          this.logger.error(err);
          throw err;
        }

        this.logger.debug(`Jwonwebtoken generated: ${jwt}`);
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
   * @throws {ServiceNotInitalizedError}
   * @throws {Error}
   */
  async verifyJWT(jwt: string): Promise<JWTPayload> {
    this.logger.debug('Get the required configuration parameter to verify JWT');
    const secretKey = await this.getSecretKey();
    const algorithm = await this.getAlgorithm();

    this.logger.debug('Start verifing jsonwebtoken');
    return new Promise<JWTPayload>((resolve, reject) => {
      jsonwebtoken.verify(jwt, secretKey, { algorithms: [algorithm] }, (err, payload: JWTPayload) => {
        if (err) {
          this.logger.debug('JWT is not valid');
          this.logger.warn(err);
          throw err;
        }

        this.logger.debug('Jsonwebtoken is valid');
        resolve(payload);
      });
    });
  }
}
