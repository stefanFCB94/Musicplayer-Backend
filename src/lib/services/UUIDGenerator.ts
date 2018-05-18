import 'reflect-metadata';
import * as uuid from 'uuid';
import { IUUIDGenerator } from '../interfaces/services/IUUIDGenerator';
import { ILogger } from '../interfaces/services/ILogger';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Service to generate no unique identifier.
 * 
 * Service can be instantiated as singleton or a service, which
 * will be generated for every other service a own dependency,
 * because the service don't store a state
 * 
 * Will be used to generate new UUIDs, which are required to 
 * store entities in the database, because every database entity
 * will be identified through a unique ID.
 * 
 * @requires uuid
 * @requires ILogger
 */

@injectable()
export class UUIDGenerator implements IUUIDGenerator {

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
  ) {}

  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Method generates a new UUID version 4.
   * 
   * UUID of version 4 is a random UUID.
   * Method will reutrn the generated UUID
   * 
   * @returns {string} The generated UUID
   */
  public generateV4(): string {
    const id = uuid.v4();
    this.logger.log(`UUID generated: ${id}`, 'debug');
    
    return id;
  }
}

