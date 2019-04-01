import { Logger } from './Logger.service';
import { DatabaseService } from '../database/database.service';
import { Repository } from 'typeorm';
import { Client } from '../database/models/Client';
import { RequiredParameterNotPresentError } from '../errors/RequiredParameterNotPresent.error';
import { LogLevel } from '../enums/LogLevel';
import { ClientNotFoundError } from '../errors/ClientNotFound.error';
import uuid = require('uuid');
import { ClientNotInsertableError } from '../errors/ClientNotInsertable.error';
import { ValidationService } from './Validation.service';
import { InvalidIDFormatError } from '../errors/InvalidIDFormat.error';
import { ClientNameNotPresentError } from '../errors/ClientNameNotPresent.error';
import { ClientNameOutOfBoundsError } from '../errors/ClientNameOutOfBounds.error';
import { ClientNameNotUniqueError } from '../errors/ClientNameNotUnique.error';
import { ClientSecretNotSetError } from '../errors/ClientSecretNotSet.error';
import { ClientSecretOutOfBoundsError } from '../errors/ClientSecretOutOfBounds.error';
import { ClientNotDeleteableError } from '../errors/ClientNotDeleteable.error';


export class ClientService {

  private logger: Logger;
  private db: DatabaseService;
  private validation: ValidationService;

  constructor(
    logger: Logger,
    db: DatabaseService,
  ) {
    this.logger = logger;
    this.db = db;
    this.validation = new ValidationService();
  }


  private async getClientByName(reqId: string, name: string): Promise<Client> {
    const clientRepository = this.db.getConnection().getRepository(Client);
    const client = await clientRepository.findOne({ where: { name } });

    if (client) {
      this.logger.log(reqId, `Client ${client.id} successfully loaded from database`, LogLevel.DEBUG);
    } else {
      this.logger.log(reqId, `Client ${name} could not be found in database`, LogLevel.DEBUG);
    }

    return client;
  }

  private async validateClient(reqId: string, client: Client): Promise<Error[]> {
    const errors = [];

    if (!this.validation.isValidID(client.id)) {
      const error = new InvalidIDFormatError('ID has invalid format');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    if (!client.name) {
      const error = new ClientNameNotPresentError('Client name not set');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    if (client.name.length > 255) {
      const error = new ClientNameOutOfBoundsError('Client name has maximum length of 255 characters');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    if (await this.getClientByName(reqId, client.name)) {
      const error = new ClientNameNotUniqueError(`Client with name ${client.name} already exists`);
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    if (!client.secret) {
      const error = new ClientSecretNotSetError('Client secret must be set');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    if (client.secret.length > 128) {
      const error = new ClientSecretOutOfBoundsError('Client secret has maximum length of 128 characters');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      errors.push(error);
    }

    return errors;
  }


  public async getClients(reqId: string): Promise<Client[]> {
    const clientRepository: Repository<Client> = this.db.getConnection().getRepository(Client);
    const clients = await clientRepository.find();

    this.logger.log(reqId, `Clients successfully loaded from database (Found results: ${clients.length})`, LogLevel.DEBUG);
    return clients;
  }

  public async getClient(reqId: string, clientId: string): Promise<Client> {
    if (!clientId) {
      const error =  new RequiredParameterNotPresentError('Client-ID not present');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      throw error;
    }

    const clientRepository = this.db.getConnection().getRepository(Client);
    const client = await clientRepository.findOne({ where: { id: clientId } });

    if (!client) {
      const error = new ClientNotFoundError(`Client ${clientId} not found`);
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      throw error;
    }

    this.logger.log(reqId, `Client ${clientId} successfull retrieved from the database`, LogLevel.DEBUG);
    return client;
  }

  public async upsertClient(reqId: string, client: Client): Promise<Client> {
    if (!client) {
      const error = new RequiredParameterNotPresentError('Parameter client not present');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      throw error;
    }

    // Check, if client should be created or updated
    if (!client.id) {
      this.logger.log(reqId, 'Client should be created', LogLevel.DEBUG);
      client.id = uuid.v4();
    } else {
      this.logger.log(reqId, `Client ${client.id} should be upgraded`, LogLevel.DEBUG);
    }

    // Validate inputs
    this.logger.log(reqId, 'Start validating client information', LogLevel.DEBUG);
    const errors = await this.validateClient(reqId, client);

    // Throw validation errors
    if (errors.length > 0) {
      this.logger.log(reqId, 'Client not insertable, because at least one error was found', LogLevel.DEBUG);
      throw errors;
    }

    this.logger.log(reqId, 'Validation finished, all information are valid', LogLevel.DEBUG);

    try {
      const repo = this.db.getConnection().getRepository(Client);
      const ret = await repo.save(client);

      this.logger.log(reqId, `Client ${ret.id} successfully updated / inserted`, LogLevel.DEBUG);
      return ret;
    } catch (err) {
      this.logger.log(reqId, err.stack, LogLevel.WARN);
      throw new ClientNotInsertableError('Client could not be inserted or updated');
    }
  }

  public async deleteClient(reqId: string, clientId: string): Promise<void> {
    if (!clientId) {
      const error = new RequiredParameterNotPresentError('Parameter clientId not present');
      this.logger.log(reqId, error.stack, LogLevel.WARN);
      throw error;
    }

    try {
      this.logger.log(reqId, 'Try to delete client from database', LogLevel.DEBUG);

      const repository = this.db.getConnection().getRepository(Client);
      const result = await repository.delete({ id: clientId });

      if (result.affected === 0) {
        const error = new ClientNotFoundError(`Client ${clientId} not found in the database`);
        this.logger.log(reqId, error.stack, LogLevel.WARN);
        throw error;
      }

      this.logger.log(reqId, `Client ${clientId} successfully deleted`, LogLevel.DEBUG);
    } catch (err) {
      this.logger.log(reqId, err.stack, LogLevel.ERROR);
      throw new ClientNotDeleteableError(`Client ${clientId} could not be deleted`);
    }
  }

}
