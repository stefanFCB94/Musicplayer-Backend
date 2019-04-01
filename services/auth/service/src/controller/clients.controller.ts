import * as express from 'express';
import { Logger } from '../services/Logger.service';
import { DatabaseService } from '../database/database.service';
import { ClientService } from '../services/Client.service';
import { LogLevel } from '../enums/LogLevel';
import { UnsupportedError } from '../errors/Unsupported.error';
import { sendError } from '../utils/sendError';
import { sendData } from '../utils/sendData';
import { ClientNotFoundError } from '../errors/ClientNotFound.error';
import { RequiredParameterNotPresentError } from '../errors/RequiredParameterNotPresent.error';
import { ClientNotInsertableError } from '../errors/ClientNotInsertable.error';
import { ClientNotDeleteableError } from '../errors/ClientNotDeleteable.error';

export class ClientsController {

  private router: express.Router;
  private logger: Logger;
  private database: DatabaseService;
  private clientService: ClientService;

  constructor(logger: Logger, database: DatabaseService) {
    this.router = express.Router();

    this.logger = logger;
    this.database = database;

    this.clientService = new ClientService(this.logger, this.database);
  }

  public getRouter(): express.Router {
    return this.router;
  }



  public async init(): Promise<void> {
    this.router.get('/clients', (req, res) => this.getClients(req, res));
    this.router.post('/clients', (req, res) => this.upsertClient(req, res));
    this.router.get('/clients/:client', (req, res) => this.getClient(req, res));
    this.router.put('/clients/:client', (req, res) => this.upsertClient(req, res));
    this.router.delete('/clients/:client', (req, res) => this.deleteClient(req, res));

    this.router.get('/clients/:client/scopes', (req, res) => this.getClientScopses(req, res));
    this.router.post('/clients/:client/scopes', (req, res) => this.insertClientScope(req, res));
    this.router.get('/client/:client/scopes/:scope', (req, res) => this.getClientScope(req, res));
    this.router.delete('/clients/:client/scopes/:scope', (req, res) => this.deleteClientScope(req, res));
  }



  private async getClients(req: express.Request, res: express.Response) {
    const reqId = req.header('request-id');

    try {
      const clients = await this.clientService.getClients(reqId);
      res.status(200).send(sendData(clients));
    } catch (err) {
      const error = new UnsupportedError('Unsupported error occured');
      this.logger.log(reqId, err.stack, LogLevel.ERROR);
      res.status(500).send(sendError(error));
    }

  }

  private async getClient(req: express.Request, res: express.Response) {
    const reqId = req.header('request-id');

    try {
      const clientId = req.params.client;
      const client = await this.clientService.getClient(reqId, clientId);

      res.status(200).send(sendData(client));
    } catch (err) {
      if (err instanceof RequiredParameterNotPresentError) return res.status(422).send(sendError(err));
      if (err instanceof ClientNotFoundError) return res.status(404).send(sendError(err));

      this.logger.log(reqId, err.stack, LogLevel.ERROR);
      const error = new UnsupportedError('Unsupported error requesting a client');
      res.status(500).send(sendError(error));
    }
  }

  private async upsertClient(req: express.Request, res: express.Response) {
    const reqId = req.header('request-id');

    try {
      const client = req.body;
      const ret = await this.clientService.upsertClient(reqId, client);

      res.status(200).send(sendData(ret));
    } catch (err) {
      // Validation error
      if (Array.isArray(err)) return res.status(422).send(sendError(err));
      if (err instanceof RequiredParameterNotPresentError) return res.status(422).send(sendError(err));
      if (err instanceof ClientNotInsertableError) return res.status(500).send(sendError(err));

      // Unknown error
      const error = new UnsupportedError('Unsupported error upserting a client');
      this.logger.log(reqId, err.stack, LogLevel.ERROR);
      res.status(500).send(sendError(error));
    }
  }

  private async deleteClient(req: express.Request, res: express.Response) {
    const reqId = req.header('request-id');

    try {
      const clientId = req.params.client;
      await this.clientService.deleteClient(reqId, clientId);

      res.status(204).send();
    } catch (err) {
      if (err instanceof RequiredParameterNotPresentError) return res.status(422).send(sendError(err));
      if (err instanceof ClientNotFoundError) return res.status(404).send(sendError(err));
      if (err instanceof ClientNotDeleteableError) return res.status(500).send(sendError(err));

      this.logger.log(reqId, err.stack, LogLevel.ERROR);
      const error = new UnsupportedError('Unsupported error deleting a client');
      res.status(500).send(sendError(error));
    }
  }


  private async getClientScopses(req: express.Request, res: express.Response) {

  }

  private async getClientScope(req: express.Request, res: express.Response) {

  }

  private async insertClientScope(req: express.Request, res: express.Response) {

  }

  private async deleteClientScope(req: express.Request, res: express.Response) {

  }
}
