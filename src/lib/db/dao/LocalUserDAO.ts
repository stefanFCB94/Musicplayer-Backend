import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IDatabaseService } from '../../interfaces/db/IDatabaseService';
import { ILogger } from '../../interfaces/services/ILogger';
import { Repository, FindManyOptions } from 'typeorm';
import { LocalUser } from '../models/LocalUser';
import { ILocalUserDAO } from '../../interfaces/dao/ILocalUserDAO';
import { UserAlreadyExistsError } from '../../error/db/UserAlreadyExistsError';
import { RequiredParameterNotSet } from '../../error/db/RequiredParameterNotSetError';
import { ParameterOutOfBoundsError } from '../../error/db/ParameterOutOfBoundsError';
import { UnsupportedParamterValueError } from '../../error/db/UnsupportedParamterValueError';
import { ServiceNotInitializedError } from '../../error/ServiceNotInitalizedError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * Class to handle all database request for the table for the local users.
 * Alle inserts, updates, deletes and selects for local users should run
 * through these class
 * 
 * The class serves as data access object, which includes different methods
 * for the save storing and receiving information of the local users from and
 * to the database.
 * 
 * @requires ILogger
 * @requires IDatabaseService
 * @requires IUUIDGenerator
 * @requires IPasswordHasher
 */

@injectable()
export class LocalUserDAO implements ILocalUserDAO {

  private localUserRespository: Repository<LocalUser>;

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.DatabaseService) private database: IDatabaseService,
  ) {}


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Tries to initialize the repository for the local users.
   * 
   * If the repository in the singleton instance is already defined,
   * it will return these repository, otherwise it will create a new
   * repository with the database connection from the database
   * service
   * 
   * @returns {Proimse<Repository<LocalUser>>} The initialized repository
   * 
   * @throws {ServiceNotInitializedError} If a capital error occurs until initalizing the repository
   */
  private async initRepository(): Promise<Repository<LocalUser>> {
    if (this.localUserRespository) { return this.localUserRespository; }

    this.logger.log('Initialize repository for the localUser entity', 'debug');

    try {
      const connection = await this.database.getConnection();
      this.localUserRespository = connection.getRepository(LocalUser);

      this.logger.log('LocalUser repository initialized', 'debug');
    } catch (err) {
      this.logger.log('Repository cannot be initialized. Database connection could not be retrieved', 'error');
      this.logger.log(err.stack, 'error');
      
      const error  = new ServiceNotInitializedError('IDatabaseService', 'Database service not initialized');
      throw error;
    }
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Check if all parameters for a local user are set.
   * Throws a RequiredParamterNotSet error if a required parameter
   * is not set.
   * 
   * @param {LocalUser} user The instance to check the paramters
   * 
   * @throws {RequiredParameterNotSet} If a required paramter is not set
   */
  private checkRequiredParameters(user: LocalUser) {
    let error: RequiredParameterNotSet;

    if (!user.id) {
      this.logger.log('ID of local user is not set', 'debug');
      error = new RequiredParameterNotSet('id', 'ID for the user must be set');
    }

    if (!user.mail) {
      this.logger.log('Mail address of local user is not set', 'debug');
      error = new RequiredParameterNotSet('mail', 'Mail address must be set');
    }

    if (!user.password) {
      this.logger.log('Password of local user is not set', 'debug');
      error = new RequiredParameterNotSet('password', 'The password must be set');
    }

    if (!user.lastname) {
      this.logger.log('Lastname of local user is not set', 'debug');
      error = new RequiredParameterNotSet('lastname', 'Lastname must be set');
    }

    if (error) {
      this.logger.log('Not all required parameters set', 'debug');
      this.logger.log(error.stack, 'warn');
      throw error;
    }
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Check if all paramters for a local user are in bounds.
   * If at least one paramter exceeded the maximal length
   * boundaries the method will throw a ParamterOutOfBoundsError
   * 
   * @param {LocalUser} user The instance to be checked
   * 
   * @throws {ParameterOutOfBoundsError} 
   */
  private checkParameterOutOfBounds(user: LocalUser) {
    let error: ParameterOutOfBoundsError;

    if (user.id.length > 36) {
      error = new ParameterOutOfBoundsError('id', 'ID out of bounds');
      this.logger.log('ID is out of bounds for local user', 'debug');
    }

    if (user.firstname && user.firstname.length > 64) {
      error = new ParameterOutOfBoundsError('firstname', 'Firstname out of bounds');
      this.logger.log('Firstname is out of bound for local user', 'debug');
    }

    if (user.lastname.length > 64) {
      error = new ParameterOutOfBoundsError('lastname', 'Lastname out of bounds');
      this.logger.log('Lastname is out of bounds', 'debug');
    }

    if (user.mail.length > 128) {
      error = new ParameterOutOfBoundsError('mail', 'Mail out of bounds');
      this.logger.log('Mail address for local user is out of bounds', 'debug');
    }

    if (user.password.length > 128) {
      error = new ParameterOutOfBoundsError('password', 'Password out of bounds');
      this.logger.log('Password for local user is out of bounds', 'debug');
    }


    if (error) {
      this.logger.log('At least one parameter is out of bounds', 'debug');
      this.logger.log(error.stack, 'warn');

      throw error;
    }
  }

  /**
   * @private
   * @author Stefan Läufle
   * 
   * Checks if a parameter of a local user object stores a
   * unsupported value.
   * If at least one case exists a UnsupportedParameterValue
   * is be thrown
   * 
   * @param {LocalUser} user The local user to be checked
   * 
   * @throws {UnsupportedParamterValueError} 
   */
  private checkUnsupportedParameterValue(user: LocalUser) {
    let error: UnsupportedParamterValueError;

    if (user.loginPossible !== 0 && user.loginPossible !== 1) {
      error = new UnsupportedParamterValueError('loginPossible', user.loginPossible);
      this.logger.log('Value for loginPossible of local user has a unsupported value', 'debug');
    }


    if (error) {
      this.logger.log('At least one value of local user has unsupported value', 'debug');
      this.logger.log(error.stack, 'warn');

      throw error;
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Saves or updates a local user to the database.
   * If the user already exists in the database, it will be
   * updated, if the user not exists, it will be inserted.
   * 
   * Checks, if the required attributes are set in the instance,
   * otherwise it will return a RequiredParamterNotSet error.
   * 
   * Checks, if the string paramters, have the correct size,
   * otherwise it return a ParameterOutOfBoundsError.
   * 
   * Checks the paramter value for supported values. If a
   * field is tried to be saved with a unsupported value
   * a UnsupportedParamterValueError is thrown
   * 
   * @param {LocalUser} user The user object, that should be saved
   * 
   * @returns {Promise<LocalUser>} The saved user object
   * 
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {UnsupportedParamterValueError}
   * @throws {ServiceNotInitializedError}
   */
  public async saveOrUpdateUser(user: LocalUser): Promise<LocalUser> {
    await this.initRepository();

    // Check paramter values
    this.logger.log('Start checking for paramter errors', 'debug');
    this.checkRequiredParameters(user);
    this.checkParameterOutOfBounds(user);
    this.checkUnsupportedParameterValue(user);

    try {
      const savedUser = await this.localUserRespository.save(user);
      this.logger.log('User saved to the database', 'debug');

      return savedUser;
    } catch (err) {
      this.logger.log(err.stack, 'error');
      this.logger.log('Unsupported error on saving local user to database', 'error');

      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Select all local users from the database.
   * Supports pagination items skip and maxItems to
   * limit the number of results, that are returned.
   * 
   * @param {string} orderCol The order column (default: id)
   * @param {string} orderDirection The order direction (ASC or DESC)
   * @param {number} skip The number of items that should be skipped
   * @param {string} maxItems The maximal number of items that should be returned
   * 
   * @returns {Promise<LocalUser[]>}  The found users
   * 
   * @throws {ServiceNotInitializedError} If the database service is not initialized
   * @throws {Error} Unsupported error
   */
  public async getUsers(orderCol: string = 'id', orderDirection: string = 'ASC', skip?: number, maxItems?: number): Promise<LocalUser[]> {
    return this.searchForUsers(null, orderCol, orderDirection, skip, maxItems);
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Search the database for users, that match given
   * criteria, passed in as paramter to the method.
   * 
   * The parameter for the filter criteria should be
   * passed in as, that the field, which should be queryied,
   * should given as key and the query value as value for
   * that key.
   * 
   * The result can be sorted and passed with pagination
   * parameters.
   * 
   * @param {Object} where The filter criterias
   * @param {string} orderCol The name of the column to sort for
   * @param {string} orderDirection The order direction (ASC or DESC)
   * @param {number} skip The number of items, that should be skipped
   * @param {number} maxItems The number of items, that should be returned
   * 
   * @returns {Promise<LocalUser[]>} The found users
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  public async searchForUsers(
    where: { [field: string]: any }, 
    orderCol: string = 'id', 
    orderDirection: string = 'ASC', 
    skip?: number, 
    maxItems?: number,
  ): Promise<LocalUser[]> {
    await this.initRepository();
    
    this.logger.log('Start query for local users from the databse', 'debug');
    this.logger.log('Filter parameter: ' + where.toString(), 'debug');
    this.logger.log(`Skip paramter: ${skip}`, 'debug');
    this.logger.log(`Max items paramter: ${maxItems}`, 'debug');

    try {
      const options: FindManyOptions<LocalUser> = {
        where,
        skip,
        take: maxItems,
        order: { [orderCol]: orderDirection },
      };
      const users = await this.localUserRespository.find(options);
      
      this.logger.log('Query for users finished', 'debug');
      this.logger.log(`Selected users: ${users.length}`, 'debug');

      return users;
    } catch (err) {
      this.logger.log('Error by querying the database for local users', 'debug');
      this.logger.log(err.stack, 'error');

      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Query the database for a single user by a ID.
   * It will be returned the found user instance or null.
   * 
   * @param {string} id The id of the user to be searched for
   * 
   * @returns {Promise<LocalUser>} The found user
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getUserById(id: string): Promise<LocalUser> {
    await this.initRepository();
    
    this.logger.log('Start searching for a user by its id', 'debug');
    this.logger.log(`User with ID '${id}' should be searched`, 'debug');

    try {
      const user = await this.localUserRespository.findOne({ where: { id } });

      this.logger.log('Query for local user finished', 'debug');
      if (user) {
        this.logger.log('User has been found', 'debug');
      } else {
        this.logger.log('User has not been found', 'debug');
      }

      return user;
    } catch (err) {
      this.logger.log('A error by searching for a user by id occured', 'debug');
      this.logger.log(err.stack, 'error');

      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Query the database for a single user by a mail address.
   * It will by returned the found user or null.
   * 
   * @param {string} mail The mail address
   * 
   * @returns {Promise<LocalUser>} The found user
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  public async getUserByMail(mail: string): Promise<LocalUser> {
    await this.initRepository();
    
    this.logger.log('Start searching for a user by mail address', 'debug');
    this.logger.log(`User with mail '${mail}' should be searched`, 'debug');

    try {
      const user = await this.localUserRespository.findOne({ where: { mail } });

      this.logger.log('Query for local user finished', 'debug');
      if (user) {
        this.logger.log('User has been found', 'debug');
      } else {
        this.logger.log('User has not been found', 'debug');
      }

      return user;
    } catch (err) {
      this.logger.log('A error by searching for a user by mail occured', 'debug');
      this.logger.log(err.stack, 'error');

      throw err;
    }
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Delete a local user from the database.
   * If the user can not be found, the method will return null, 
   * otherwise it will return the deleted entity.
   * 
   * @param {LocalUser} user The user to be deleted
   * 
   * @returns {LocalUser} The deleted user
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  public async deleteUser(user: LocalUser): Promise<LocalUser> {
    await this.initRepository();
    
    this.logger.log('Start deleting user', 'debug');
    
    try {
      const deletedUser = await this.localUserRespository.remove(user);

      this.logger.log('Deletion of user has finished', 'debug');
      if (deletedUser) {
        this.logger.log('Delete of user succesfully finished', 'debug');
      } else {
        this.logger.log('User could not delete, because user not found', 'debug');
      }

      return deletedUser;
    } catch (err) {
      this.logger.log('Error by deleting user occured', 'debug');
      this.logger.log(err.stack, 'error');

      throw err;
    }
  }

}
