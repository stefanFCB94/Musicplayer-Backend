import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../interfaces/services/ILogger';
import { IPasswordHasher } from '../interfaces/services/IPasswordHasher';
import { IUUIDGenerator } from '../interfaces/services/IUUIDGenerator';
import { ILocalUserDAO } from '../interfaces/dao/ILocalUserDAO';
import { IConfigServiceProvider, IConfigService } from '../interfaces/services/IConfigService';
import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';
import { RequestParameterNotSetError } from '../error/request/RequestParameterNotSetError';
import { UserNotExistsError } from '../error/auth/UserNotExistsError';
import { PasswordNotMatchError } from '../error/auth/PasswordNotMatchError';
import { UserNotLoginableError } from '../error/auth/UserNotLoginableError';
import { IJWTGenerator, JWTPayload } from '../interfaces/services/IJWTGenerator';
import { LocalUser } from '../db/models/LocalUser';
import { SignupValues, SignupReturn } from '../interfaces/services/IAuthentificatonService';
import { UserAlreadyExistsError } from '../error/auth/UserAlreadyExistsError';


@injectable()
export class AuthentificationService {
  
  private configService: IConfigService;

  private signupPossibleDefault = false;
  private signupPossibleKey = 'SIGNUP.POSSIBLE';

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.PasswordHasher) private passwordHasher: IPasswordHasher,
    @inject(TYPES.UUIDGenerator) private uuidGenerator: IUUIDGenerator,
    @inject(TYPES.LocalUserDAO) private localUserDAO: ILocalUserDAO,
    @inject(TYPES.JWTGenerator) private jwtGenerator: IJWTGenerator,
    @inject(TYPES.ConfigService) private configProvider: IConfigServiceProvider,
  ) {}


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the config service for the authentification service.
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
    if (this.configService) { return; }

    // ConfigService is not used before
    // So make sure it is initalized and the config is loaded
    this.logger.log('Start initialize the configuration service for the authentification service', 'debug');

    try {
      this.configService = await this.configProvider();

      // tslint:disable-next-line:max-line-length
      this.logger.log('Finished to initialize the configuration service for authentification service', 'debug');
      return;
    } catch (err) {
      this.logger.log('Configuration service could not be initialized', 'debug');
      
      const error = new ServiceNotInitializedError('IConfigService', 'Config service could not be initalized');
      this.logger.log(error.stack, 'error');

      throw error;
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get information, if the signup for new users is available or not.
   * 
   * If the signup is not available, new users can only be created by
   * the administrator of the application.
   * 
   * If signup is available, it is possible for new users to signup
   * for them self.
   * 
   * @returns {Promise<boolean>} Information if signup is available
   * 
   * @throws {ServiceNotInitializedError} If the config service could not
   *                                      be initialized
   */
  public async isSignupAvailable(): Promise<boolean> {
    await this.initConfigService();

    const available = this.configService.get(this.signupPossibleKey);

    if (typeof available === 'boolean') {
      return available;
    }

    return this.signupPossibleDefault;
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Creates a new user account.
   * 
   * The method will create a new user account with the
   * information passed in as parameter. The function will
   * check if the user with the mail address already exists, and
   * if alle neccassary information are passed in.
   * 
   * If the requirements are fullfilled it will create the
   * user account by generating a new id for the user and
   * by hashing theh passed in password.
   * 
   * If a error, which pretend the creation of the new user,
   * occurs, the function will throw that error.
   * 
   * @param {SignupValues} data The neccassary information
   * 
   * @returns {SignupReturn} The created user and the jsonwebtoken
   * 
   * @throws {UserAlreadyExistsError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {UnsupportedParamterValueError}
   * @throws {ServiceNotInitializedError}
   * @throws {RequestParameterNotSetError}
   * @throws {Error}
   */
  public async signup(data: SignupValues): Promise<SignupReturn> {
    let id: string;
    let pw: string;
    let newUser: LocalUser;
    let jwt: string;

    this.logger.log('Signup of a new user will be started', 'debug');

    try {
      this.logger.log('Try to find the user with the mail address in the database', 'debug');
      const existingUser = await this.localUserDAO.getUserByMail(data.mail);

      if (existingUser) {
        this.logger.log(`User with mail address ${data.mail} already existing in the database`, 'debug');

        const error = new UserAlreadyExistsError(`User with mail address ${data.mail} already exists`);
        this.logger.log(error.stack, 'warn');
        throw error;
      }

      this.logger.log('User do not exist in the database, so create a new user', 'debug');
    } catch (err) {
      this.logger.log('Error by querying the database for as user with mail address', 'debug');
      throw err;
    }

    try {
      this.logger.log('Create a new ID for the new user', 'debug');
      id = await this.uuidGenerator.generateV4();
      this.logger.log(`New UUID for user generated: ${id}`, 'debug');
    } catch (err) {
      this.logger.log('UUID could not be generated', 'debug');
      throw err;
    }

    const user = new LocalUser();
    user.id = id;
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.mail = data.mail;

    if (typeof data.loginPossible === 'boolean' && !data.loginPossible) {
      user.loginPossible = 0;
    }

    try {
      this.logger.log('Hash the password for the user', 'debug');
      pw = await this.passwordHasher.hash(data.password);
      this.logger.log('Password successfully hashed', 'debug');
    } catch (err) {
      this.logger.log('Password could not be hashed', 'debug');
      throw err;
    }

    user.password = pw;


    try {
      this.logger.log('Try to insert the user to the database', 'debug');
      newUser = await this.localUserDAO.saveOrUpdateUser(user);
      this.logger.log('User saved to the database', 'debug');
    } catch (err) {
      this.logger.log('User cannot be saved in the database', 'debug');
      throw err;
    }

    try {
      this.logger.log('Try to create a jwt for the newly created user', 'debug');
      jwt = await this.jwtGenerator.generateJWT(newUser);
      this.logger.log('JWT for new user generated', 'debug');
    } catch (err) {
      this.logger.log('JWT could not be generated for new user', 'debug');
      throw err;
    }

    delete newUser.password;

    return {
      jwt,
      user: newUser,
    };
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Make the login for the user.
   * 
   * For the login it will be check if the user exists,
   * the passed in password matches the saved one and if the
   * user can log in.
   * 
   * If all the required conditions are true, a jsonwebtoken
   * will be generated and returned.
   * 
   * @param {string} mail The mail address of the user
   * @param {string} password The password of the user (unhashed)
   * 
   * @returns {Promise<string>} The generated JWT
   * 
   * @throws {RequestParameterNotSetError} If a parameter is not passed in correct
   * @throws {UserNotExistsError} If the user not exists
   * @throws {UserNotLoginableError} If the user is configured as not loginable
   * @throws {PasswordNotMatchError} If the password does not match
   * @throws {Error} A unhandled error occurs
   */
  public async login(mail: string, password: string): Promise<string> {
    if (!mail || typeof mail !== 'string') {
      const error = new RequestParameterNotSetError('mail', 'The mail address must be set to login an user');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    if (!password || typeof password !== 'string') {
      const error = new RequestParameterNotSetError('password', 'The password must be set to login an user');
      this.logger.log(error.stack, 'warn');

      throw error;
    }


    // Try to find the user in the datase
    this.logger.log('Try to find the user', 'debug');
    const user = await this.localUserDAO.getUserByMail(mail);

    if (!user) {
      const error = new UserNotExistsError(mail, null, 'User not found');
      this.logger.log(error.stack, 'warn');

      throw error;
    }
    this.logger.log('User found in the database', 'debug');

    // Check if user can log in
    this.logger.log('Check if user can log in', 'debug');
    if (user.loginPossible !== 1) {
      const error = new UserNotLoginableError(`User with mail address ${mail} can not login`);
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    // Check if password matches
    this.logger.log('Check if password matches the password in the database', 'debug');
    const match = await this.passwordHasher.compare(password, user.password);

    if (!match) {
      const error = new PasswordNotMatchError('Invalid password');
      this.logger.log(error.stack, 'warn');

      throw error;
    }
    this.logger.log('Password ok, user will be logged in now', 'debug');

    // Creates the jsonwebtoken for the user
    this.logger.log('Start creating the jwt for the user', 'debug');

    try {
      const jwt = await this.jwtGenerator.generateJWT(user);
      this.logger.log('Jsonwebtoken successfully generated', 'debug');
      return jwt;
    } catch (err) {
      this.logger.log('Jsonwebtoken could not be generated', 'debug');
      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Check if the jsonwebtoken is valid.
   * 
   * Returns the id of the user for the valid jwt.
   * Throws an error, if the jwt is not valid
   * 
   * @param {string} jwt The jwt to check
   * 
   * @returns {Promise<string>} The id of the user
   * 
   * @throws {RequestParameterNotSetError}
   * @throws {JsonWebTokenError}
   * @throws {NotBeforeError}
   * @throws {TokenExpiredError}
   */
  public async isLoggedIn(jwt: string): Promise<string> {
    if (!jwt || typeof jwt !== 'string') {
      const error = new RequestParameterNotSetError('jwt', 'Jsonwebtoken not set');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    try {
      const payload = await this.jwtGenerator.verifyJWT(jwt);
      this.logger.log('JWT valid, user is logged in', 'debug');

      return payload.userId;
    } catch (err) {
      this.logger.log('JWT not valid', 'debug');
      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Method to renew a existing JSON web token.
   * 
   * Method accepts a actual JWT, checks, if the JWT ist valid,
   * the user exists and if the user can login anymore. If all
   * of the conditions are valid, the user function will create
   * a new JWT, with a new expire date.
   * 
   * @param {string} jwt The JWT, which should be renewed
   * 
   * @return {Promise<string>} The newly generated jwt
   * 
   * @throws {RequestParameterNotSetError}
   * @throws {JsonWebTokenError}
   * @throws {NotBeforeError}
   * @throws {TokenExpiredError}
   * @throws {ServiceNotInitializedError}
   * @throws {UserNotExistsError}
   * @throws {UserNotLoginableError}
   * @throws {Error}
   */
  public async renewJWT(jwt: string): Promise<string> {
    let userId: string;
    let user: LocalUser;
    let newJWT: string;

    if (!jwt || typeof jwt !== 'string') {
      const error = new RequestParameterNotSetError('jwt', 'JWT, which should be renewd, must be given');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    try { 
      this.logger.log('Check if given JWT is valid and user is logged in at the moment', 'debug');
      userId = await this.isLoggedIn(jwt);
    } catch (err) {
      this.logger.log('User not logged in, JWT verify failed', 'debug');
      throw err;
    }

    try {
      this.logger.log('Try to find the logged in user information', 'debug');
      user = await this.localUserDAO.getUserById(userId);
    } catch (err) {
      this.logger.log('Error by querying the database for user', 'debug');
      throw err;
    }

    if (!user) {
      const error = new UserNotExistsError(null, userId, 'User does not exist anymore');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    if (!user.loginPossible) {
      const error = new UserNotLoginableError('Useraccount can not login anymore');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    try {
      this.logger.log('User found in database, now create new JWT for user', 'debug');
      newJWT = await this.jwtGenerator.generateJWT(user);
    } catch (err) {
      this.logger.log('JWt could not be generated', 'debug');
      throw err;
    }

    return newJWT;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set a new password for a user account.
   * 
   * Password for a user account could be saved, if the
   * user put in the password, which is actual set for
   * the user account and a new password.
   * 
   * For security reasons, the passed in password must
   * match the actual setted password for the user
   * account.
   * 
   * @param {string} userId The ID of the user
   * @param {string} oldPw The actual setted password (not hashed)
   * @param {string} newPw The new password (not hashed)
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {UnsupportedParamterValueError}
   * @throws {ServiceNotInitializedError}
   * @throws {RequestParameterNotSetError}
   * @throws {PasswordNotMatchError}
   * @throws {Error}
  
   */
  public async resetPassword(userId: string, oldPw: string, newPw: string): Promise<void> {
    if (!userId || typeof userId !== 'string') {
      const error = new RequestParameterNotSetError('userId', 'The user id was not passed to the function');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    if (!oldPw || typeof oldPw !== 'string') {
      const error = new RequestParameterNotSetError('oldPw', 'The old password was not passed to the function');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    if (!newPw || typeof newPw !== 'string') {
      const error = new RequestParameterNotSetError('newPw', 'The new password was not passed to the function');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    let user: LocalUser;
    try {
      this.logger.log('Try to get the user from the database', 'debug');
      user = await this.localUserDAO.getUserById(userId);
    } catch (err) {
      this.logger.log('User could not be located in the database', 'debug');
      throw err;
    }

    if (!user) {
      const error = new UserNotExistsError(null, userId, 'The user not exists');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    let result: boolean;
    try {
      this.logger.log('Check if old password matches the one in the database', 'debug');
      result = await this.passwordHasher.compare(oldPw, user.password);
    } catch (err) {
      this.logger.log('Password could not be compared', 'debug');
      throw err;
    }
      
    if (!result) {
      const error = new PasswordNotMatchError('The old password not matches the saved one');
      this.logger.log(error.stack, 'warn');

      throw error;
    }

    let newPwHash: string;
    try {
      this.logger.log('Start hashing the new password', 'debug');
      newPwHash = await this.passwordHasher.hash(newPw);
    } catch (err) {
      this.logger.log('New password could not be hashed', 'debug');
      throw err;
    }
    

    try {
      this.logger.log('Update the user information', 'debug');
      user.password = newPwHash;

      await this.localUserDAO.saveOrUpdateUser(user);
    } catch (err) {
      this.logger.log('User could not be updated', 'debug');
      throw err;
    }

    this.logger.log('Password successfully updated', 'debug');
  }
}
