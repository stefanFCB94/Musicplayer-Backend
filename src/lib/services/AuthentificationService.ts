import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

import { BaseSystemPreferenceService } from '../base/BaseSystemPreferenceService';
import { IAuthentificationService,SignupValues, SignupReturn } from '../interfaces/services/IAuthentificatonService';

import { LocalUser } from '../db/models/LocalUser';

import { ILogger } from '../interfaces/services/ILogger';
import { IPasswordHasher } from '../interfaces/services/IPasswordHasher';
import { IUUIDGenerator } from '../interfaces/services/IUUIDGenerator';
import { ILocalUserDAO } from '../interfaces/dao/ILocalUserDAO';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';
import { IJWTGenerator, JWTPayload } from '../interfaces/services/IJWTGenerator';

import { ServiceNotInitializedError } from '../error/ServiceNotInitalizedError';
import { RequestParameterNotSetError } from '../error/request/RequestParameterNotSetError';
import { UserNotExistsError } from '../error/auth/UserNotExistsError';
import { PasswordNotMatchError } from '../error/auth/PasswordNotMatchError';
import { UserNotLoginableError } from '../error/auth/UserNotLoginableError';
import { UserAlreadyExistsError } from '../error/auth/UserAlreadyExistsError';



@injectable()
export class AuthentificationService extends BaseSystemPreferenceService implements IAuthentificationService {
  
  protected passwordHasher: IPasswordHasher;
  protected uuidGenerator: IUUIDGenerator;
  protected localUserDAO: ILocalUserDAO;
  protected jwtGenerator: IJWTGenerator;

  private signupPossibleKey = 'SIGNUP.POSSIBLE';

  constructor(
    @inject(TYPES.PasswordHasher) passwordHasher: IPasswordHasher,
    @inject(TYPES.UUIDGenerator) uuidGenerator: IUUIDGenerator,
    @inject(TYPES.LocalUserDAO) localUserDAO: ILocalUserDAO,
    @inject(TYPES.JWTGenerator) jwtGenerator: IJWTGenerator,
    @inject(TYPES.SystemPreferencesService) systemPrefernces: ISystemPreferencesService
  ) {
    super(systemPrefernces);

    this.passwordHasher = passwordHasher;
    this.uuidGenerator = uuidGenerator;
    this.localUserDAO = localUserDAO;
    this.jwtGenerator = jwtGenerator;

    this.systemPreferenceService.setAllowedValues(this.signupPossibleKey, [true, false]);
    this.systemPreferenceService.setDefaultValue(this.signupPossibleKey, [false]);
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
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getSignupAvailable(): Promise<boolean> {
    const available = await this.systemPreferenceService.getPreferenceValues(this.signupPossibleKey);

    if (available || available.length > 0) {
      return available[0];
    }

    return null;
  }

  /**
   * @public
   * @async
   * @author Stefan Läufle
   * 
   * Set, if user can sing up to the service by themselfs.
   * Set value will be stored in the database to be saved for later.
   * 
   * @param {boolean} signupPossible If the self signup is available
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setSignupAvailable(signupPossible: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(this.signupPossibleKey, [signupPossible]);
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
   * @throws {RequestParameterNotSetError}
   * @throws {Error}
   */
  public async signup(data: SignupValues): Promise<SignupReturn> {
    let id: string;
    let pw: string;
    let newUser: LocalUser;
    let jwt: string;

    this.logger.debug('Signup of a new user will be started');

    try {
      this.logger.debug(`Try to find the user with the mail address '${data.mail}' in the database`);
      const existingUser = await this.localUserDAO.getUserByMail(data.mail);

      if (existingUser) {
        this.logger.debug(`User with mail address ${data.mail} already existing in the database`,);

        const error = new UserAlreadyExistsError(`User with mail address ${data.mail} already exists`);
        this.logger.warn(error);
        throw error;
      }

      this.logger.debug('User do not exist in the database, so create a new user');
    } catch (err) {
      this.logger.error(err);
      throw err;
    }

    try {
      this.logger.debug('Create a new ID for the new user');
      id = await this.uuidGenerator.generateV4();
      this.logger.debug(`New UUID for user generated: ${id}`);
    } catch (err) {
      this.logger.debug('UUID for new user could not be generated');
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
      this.logger.debug('Hash the password for the user');
      pw = await this.passwordHasher.hash(data.password);
      this.logger.debug('Password of new user successfully hashed');
    } catch (err) {
      this.logger.debug('Password of new user could not be hashed');
      throw err;
    }

    user.password = pw;


    try {
      this.logger.debug('Try to insert the new user to the database');
      newUser = await this.localUserDAO.saveOrUpdateUser(user);
      this.logger.debug('User successfully saved to the database');
    } catch (err) {
      this.logger.debug('New user cannot be saved in the database');
      throw err;
    }

    try {
      this.logger.debug('Try to create a jwt for the newly created user');
      jwt = await this.jwtGenerator.generateJWT(newUser);
      this.logger.debug('JWT for new user generated');
    } catch (err) {
      this.logger.debug('JWT could not be generated for new user');
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
      this.logger.warn(error);

      throw error;
    }

    if (!password || typeof password !== 'string') {
      const error = new RequestParameterNotSetError('password', 'The password must be set to login an user');
      this.logger.warn(error);

      throw error;
    }


    // Try to find the user in the datase
    this.logger.debug(`Try to find the user '${mail}' for the login`);
    const user = await this.localUserDAO.getUserByMail(mail);

    if (!user) {
      const error = new UserNotExistsError(mail, null, 'User not found');
      this.logger.info(error);

      throw error;
    }
    this.logger.debug(`User '${mail}' to login found in the database`);

    // Check if user can log in
    this.logger.debug(`Check if user '${mail}' can log in`);
    if (user.loginPossible !== 1) {
      const error = new UserNotLoginableError(`User with mail address ${mail} can not login`);
      this.logger.warn(error);

      throw error;
    }

    // Check if password matches
    this.logger.debug(`Check if password for user '${mail}' matches the password in the database`);
    const match = await this.passwordHasher.compare(password, user.password);

    if (!match) {
      const error = new PasswordNotMatchError('Invalid password');
      this.logger.warn(error);

      throw error;
    }
    this.logger.debug(`Password of user '${mail}' ok, user will be logged in now`);

    // Creates the jsonwebtoken for the user
    this.logger.debug(`Start creating the jwt for the user '${mail}'`);

    try {
      const jwt = await this.jwtGenerator.generateJWT(user);
      this.logger.debug(`Jsonwebtoken for user '${mail}' successfully generated`);
      return jwt;
    } catch (err) {
      this.logger.debug(`Jsonwebtoken for user '${mail}' could not be generated`);
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
      this.logger.warn(error);

      throw error;
    }

    try {
      const payload = await this.jwtGenerator.verifyJWT(jwt);
      this.logger.debug(`JWT for user '${payload.mail}' valid, user is logged in`);

      return payload.userId;
    } catch (err) {
      this.logger.debug('JWT not valid');
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
      this.logger.error(error);

      throw error;
    }

    try { 
      this.logger.debug('Check if given JWT is valid and user is logged in at the moment');
      userId = await this.isLoggedIn(jwt);
    } catch (err) {
      this.logger.debug('User not logged in, JWT verify failed');
      throw err;
    }

    try {
      this.logger.debug(`Try to find the user '${userId}' in the database`);
      user = await this.localUserDAO.getUserById(userId);
    } catch (err) {
      this.logger.debug(`Error '${userId}' by querying the database for user`);
      throw err;
    }

    if (!user) {
      const error = new UserNotExistsError(null, userId, 'User does not exist anymore');
      this.logger.warn(error);

      throw error;
    }

    if (!user.loginPossible) {
      const error = new UserNotLoginableError('Useraccount can not login anymore');
      this.logger.warn(error);

      throw error;
    }

    try {
      this.logger.debug(`User '${userId}' found in database, now create new JWT for user`);
      newJWT = await this.jwtGenerator.generateJWT(user);
    } catch (err) {
      this.logger.debug(`JWt for user '${userId}' could not be generated`);
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
      this.logger.error(error);

      throw error;
    }

    if (!oldPw || typeof oldPw !== 'string') {
      const error = new RequestParameterNotSetError('oldPw', 'The old password was not passed to the function');
      this.logger.error(error);

      throw error;
    }

    if (!newPw || typeof newPw !== 'string') {
      const error = new RequestParameterNotSetError('newPw', 'The new password was not passed to the function');
      this.logger.error(error);

      throw error;
    }

    let user: LocalUser;
    try {
      this.logger.debug(`'Try to get the user '${userId}' from the database`);
      user = await this.localUserDAO.getUserById(userId);
    } catch (err) {
      this.logger.debug(`User '${userId}' could not be located in the database`);
      throw err;
    }

    if (!user) {
      const error = new UserNotExistsError(null, userId, 'The user not exists');
      this.logger.warn(error);

      throw error;
    }

    let result: boolean;
    try {
      this.logger.debug(`Check if old password of user '${user.mail}' matches the one in the database`);
      result = await this.passwordHasher.compare(oldPw, user.password);
    } catch (err) {
      this.logger.debug(`Password of user '${user.mail}' could not be compared`);
      throw err;
    }
      
    if (!result) {
      const error = new PasswordNotMatchError('The old password not matches the saved one');
      this.logger.warn(error);

      throw error;
    }

    let newPwHash: string;
    try {
      this.logger.debug(`Start hashing the new password for user '${user.mail}'`);
      newPwHash = await this.passwordHasher.hash(newPw);
    } catch (err) {
      this.logger.debug(`New password for user '${user.mail}' could not be hashed`);
      throw err;
    }
    

    try {
      this.logger.debug(`Update the user information for user '${user.mail}'`);
      user.password = newPwHash;

      await this.localUserDAO.saveOrUpdateUser(user);
    } catch (err) {
      this.logger.debug(`User '${user.mail}' could not be updated`);
      throw err;
    }

    this.logger.debug(`Password for user '${user.mail}' successfully updated`);
  }
}
