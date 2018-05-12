import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IDatabaseService } from '../../interfaces/IDatabaseService';
import { ILogger } from '../../interfaces/ILogger';
import { Repository } from 'typeorm';
import { LocalUser } from '../models/LocalUser';
import { ILocalUserDAO } from '../../interfaces/ILocalUserDAO';
import { IUUIDGenerator } from '../../interfaces/IUUIDGenerator';
import { IPasswordHasher } from '../../interfaces/IPasswordHasher';
import { UserAlreadyExistsError } from '../../error/UserAlreadyExistsError';

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
    @inject(TYPES.UUIDGenerator) private uuidGenerator: IUUIDGenerator,
    @inject(TYPES.PaswordHasher) private passwordHasher: IPasswordHasher,
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
   * @throws {Error} If a capital error occurs until initalizing the repository
   */
  private async initRepository(): Promise<Repository<LocalUser>> {
    if (this.localUserRespository) { return this.localUserRespository; }

    this.logger.log('Initialize repository for the localUser entity', 'debug');

    try {
      const connection = await this.database.getConnection();
      this.localUserRespository = connection.getRepository(LocalUser);

      this.logger.log('LocalUser repository initialized', 'debug');
    } catch (err) {
      // tslint:disable-next-line:max-line-length
      this.logger.log('Repository cannot be initialized. Database connection could not be retrieved', 'debug');
      return Promise.reject(err);
    }
  }


  /**
   * @public
   * @author Stefan Läufle
   *
   * Create a new local user in the database.
   * 
   * As parameter a LocalUser instance will be required.
   * In the instance do not include a hashed password, instead the password
   * clear text.
   * 
   * The method tries to create the user in the database. If a user with
   * the same mail address already exists, the user will not be saved and
   * overriden, but the method will be exited with a error.
   * 
   * The password, given in the parameter, will be hashed before stored
   * to the database.
   * 
   * If the user instance already includes a id that id will be used for the
   * instance. If no id is set in the instance it will create a new uuid.
   * 
   * @param {LocalUser} user The User model, which should be stored in the database
   * 
   * @returns {Promise<LocalUser>} Returns the create user instance
   * 
   * @throws {Error} If a major error ocurrs (e.g. No database connection)
   * @throws {UserAlreadyExistsError} If a user with the same mail address already exists
   */
  public async createUser(user: LocalUser): Promise<LocalUser> {
    try {
      await this.initRepository();
    } catch (err) {
      this.logger.log('User cannot be created. No repository available', 'error');
      return Promise.reject(err);
    }

    // To create a new user, first check if user is already available
    const definedUser = await this.localUserRespository.findOne({ where: { mail: user.mail } });
    if (definedUser) {
      // tslint:disable-next-line:max-line-length
      this.logger.log(`User cannot be created. Uswer with mail address ${user.mail} already defined`, 'debug');

      // tslint:disable-next-line:max-line-length
      const error = new UserAlreadyExistsError(`User with mail address ${user.mail} already in database`);
      this.logger.log(error.stack, 'warn');
      return Promise.reject(error);
    }

    // User not in the database, so now create the new user
    
    // First check if the user has already a ID
    // If not get a new ID from the UUID generator
    if (!user.id) {
      this.logger.log('Parameter user has no id, so generate new id', 'debug');
      const id = this.uuidGenerator.generateV4();
      this.logger.log(`ID ${id} for the new user generated`, 'debug');

      user.id = id;
    } else {
      this.logger.log('Parameter user has already a id, so no generation neccassary', 'debug');
    }

    // The created_by and updated_by column in this case are always the same like
    // the id of the new user
    user.createdBy = user.id;
    user.updatedBy = user.id;

    // Hash the password
    user.password = await this.passwordHasher.hash(user.password);
    this.logger.log('Password of the new user hashed', 'debug');

    try {
      const newUser = await this.localUserRespository.save(user);
      this.logger.log(`User with mail address '${newUser.mail}' created`, 'info');
      return newUser;
    } catch (err) {
      this.logger.log('Error inserting new user to the database', 'error');
      this.logger.log(err.stack, 'error');
      return Promise.reject(err);
    }
  }

}
