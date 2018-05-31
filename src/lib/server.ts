import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as bodyParser from 'body-parser';
import * as fs from 'fs-extra';
import * as compression from 'compression';
import * as helmet from 'helmet';

import { BaseConfigService } from './base/BaseConfigService';
import { IServer } from './interfaces/IServer';

import { inject, injectable } from 'inversify';
import { TYPES } from './types';

import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { resolvers } from './api/resolvers/resolvers';
import { formatError } from './api/resolvers/errors/formatError';

import { ILogger } from './interfaces/services/ILogger';
import { IConfigServiceProvider, IConfigService } from './interfaces/services/IConfigService';

import { CertificateNotFoundError } from './error/server/CertificateNotFoundError';
import { CertificateNotAFileError } from './error/server/CertificateNotAFileError';
import { CertificateNotReadableError } from './error/server/CertificateNotReadableError';
import { PrivateKeyNotAFileError } from './error/server/PrivateKeyNotAFileError';
import { PrivateKeyNotFoundError } from './error/server/PrivateKeyNotFoundError';
import { PrivateKeyNotReadableError } from './error/server/PrivateKeyNotReadableError';
import { RequiredConfigParameterNotSetError } from './error/config/RequiredConfigParamterNotSetError';


@injectable()
export class Server extends BaseConfigService implements IServer {

  private app: express.Application;

  private httpServer: http.Server;
  private httpsServer: https.Server;

  private portHTTPKey = 'SERVER.HTTP_PORT';
  private portHTTPSKey = 'SERVER.HTTPS_PORT';
  private useHTTPSKey = 'SERVER.HTTPS';
  private privateKeyKey = 'SERVER.PRIVATE_KEY';
  private certificateKey = 'SERVER.CERTIFICATE';
  private graphqlEndpointKey = 'SERVER.GRAPHQL_ENDPOINT';
  private graphiqlEndpointKey = 'SERVER.GRAPHIQL_ENDPOINT';
  private graphiqlUseKey = 'SERVER.GRAPHIQL_ACTIVE';

  private defaultHTTPPort = 3000;
  private defaultHTTPSPort = 3001;
  private defaultUseHTTPS = false;
  private defaultGraphqlEndpoint = '/graphql';
  private defaultGraphiqlEndpoint = '/graphiql';
  private defaultGraphiqlUse = true;

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) configServiceProvider: IConfigServiceProvider,
  ) {
    super(logger, configServiceProvider);
  }


  public async start() {
    await this.initConfigService();

    let portHTTP = this.configService.get(this.portHTTPKey);
    if (!portHTTP) {
      portHTTP = this.defaultHTTPPort;
    }

    let portHTTPS = this.configService.get(this.portHTTPSKey);
    if (!portHTTPS) {
      portHTTPS = this.defaultHTTPSPort;
    }

    let useHTTPS = this.configService.get(this.useHTTPSKey);
    if (typeof useHTTPS !== 'boolean') {
      useHTTPS = this.defaultUseHTTPS;
    }

    let graphqlEndpoint = this.configService.get(this.graphqlEndpointKey);
    if (!graphqlEndpoint) {
      graphqlEndpoint = this.defaultGraphqlEndpoint;
    }

    let graphiqlEndpoint = this.configService.get(this.graphiqlEndpointKey);
    if (!graphiqlEndpoint) {
      graphiqlEndpoint = this.defaultGraphiqlEndpoint;
    }

    let graphiqlUse = this.configService.get(this.graphiqlUseKey);
    if (typeof graphiqlUse !== 'boolean') {
      graphiqlUse = this.defaultGraphiqlUse;
    }

    let cert: string;
    let key: string;

    if (useHTTPS) {
      cert = this.configService.get(this.certificateKey);
      if (!cert) {
        const error = new RequiredConfigParameterNotSetError(this.certificateKey, 'Path to certificate not set in configuration file');
        this.logger.log(error.stack, 'error');

        throw error;
      }

      key = this.configService.get(this.privateKeyKey);
      if (!key) {
        const error = new RequiredConfigParameterNotSetError(this.privateKeyKey, 'Path to private key not set in configuration file');
        this.logger.log(error.stack, 'error');

        throw error;
      }
    }

    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(compression());
    this.app.use(helmet());

    this.initializeGraphQLApi(graphiqlUse, graphqlEndpoint, graphiqlEndpoint);

    this.app.use('/', (req, res) => { res.json({ test: 'It is working' }); });


    try {
      if (!useHTTPS) {
        await this.startHTTP(portHTTP);
      } else {
        await this.startHTTPS(portHTTPS, portHTTP, key, cert);
      }
    } catch (err) {
      throw err;
    }
  }

  public async stop() {
    const stopHTTPS = () => new Promise<void>((resolve) => {
      this.logger.log('Shutting down HTTPS server', 'debug');
      this.httpsServer.close(() => resolve());
    });

    const stopHTTP = () => new Promise<void>((resolve) => {
      this.logger.log('Shutting down HTTP server', 'debug');
      this.httpServer.close(() => resolve());
    });


    if (this.httpsServer) {
      await stopHTTPS();
      this.httpsServer = null;

      this.logger.log('HTTPS server was shut down', 'debug');
    }

    if (this.httpServer) {
      await stopHTTP();
      this.httpServer = null;

      this.logger.log('HTTP server was shut down', 'debug');
    }

    this.app = null;
    this.logger.log('Server successfully shut down', 'info');
  }


  private async getCertificate(file: string) {
    try {
      const stats = await fs.stat(file);
      if (!stats.isFile()) {
        const error = new CertificateNotAFileError(file, 'Certificate is a directory and not a file');
        this.logger.log(error.stack, 'error');

        throw error;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        const error = new CertificateNotFoundError(file, 'Certificate not found');
        this.logger.log(error.stack, 'error');

        throw error;
      }

      this.logger.log('Unknown error occured, by stating the certificate file', 'debug');
      this.logger.log(err.stack, 'error');
      throw err;
    }

    try {
      const access = await fs.access(file, fs.constants.R_OK);
    } catch (err) {
      const error = new CertificateNotReadableError(file, 'No permission to read certificate file');
      this.logger.log(error.stack, 'error');

      throw error;
    }

    this.logger.log('Certificate is found in the file system and can be read', 'debug');
    this.logger.log('Start reading the certificate', 'debug');

    const data = await fs.readFile(file, 'utf8');

    this.logger.log('Certificate file read successfully', 'debug');
    return data;
  }

  private async getPrivateKey(file: string) {
    try {
      const stats = await fs.stat(file);
      if (!stats.isFile()) {
        const error = new PrivateKeyNotAFileError(file, 'Private key is a directory and not a file');
        this.logger.log(error.stack, 'error');

        throw error;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        const error = new PrivateKeyNotFoundError(file, 'Private key not found');
        this.logger.log(error.stack, 'error');

        throw error;
      }

      this.logger.log('Unknown error occured, by stating the private key file', 'debug');
      this.logger.log(err.stack, 'error');
      throw err;
    }

    try {
      const access = await fs.access(file, fs.constants.R_OK);
    } catch (err) {
      const error = new PrivateKeyNotReadableError(file, 'No permission to read certificate file');
      this.logger.log(error.stack, 'error');

      throw error;
    }


    this.logger.log('Private key is found in the file system and can be read', 'debug');
    this.logger.log('Start reading the private key', 'debug');

    const data = await fs.readFile(file, 'utf8');

    this.logger.log('Private key read successfully', 'debug');
    return data;
  }



  private async startHTTP(port: number) {
    this.logger.log('Start http server', 'debug');

    if (this.httpServer) {
      this.logger.log('HTTP server could not be started, because it is already running', 'debug');
      return;
    }

    this.httpServer = http.createServer(this.app);
    this.logger.log('HTTP server is created', 'debug');

    return new Promise<void>((resolve, reject) => {
      this.httpServer.listen(port, () => {
        this.logger.log(`Server is listening on port ${port}`, 'info');
        resolve();
      });
    });
  }

  private async startHTTPS(httpsPort: number, httpPort: number, privateKeyPath: string, certPath: string) {
    let key: string;
    let cert: string;

    try {
      cert = await this.getCertificate(certPath);
      key = await this.getPrivateKey(privateKeyPath);  
    } catch (err) {
      throw err;
    }

    this.logger.log('Certificate and private key loaded', 'debug');

    const httpsOptions: https.ServerOptions = { key, cert };

    this.httpsServer = https.createServer(httpsOptions, this.app);
    this.logger.log('HTTPS server created', 'debug');

    return new Promise<void>((resolve, reject) => {
      this.httpsServer.listen(httpsPort, () => {
        this.logger.log(`HTTPS server is listening on port ${httpsPort}`, 'info');

        const redirectApp = express();
        redirectApp.all('*', (req, res) => {
          const url = `https://${req.headers.host}:${httpsPort}${req.url}`;
          res.redirect(url);
        });

        this.httpServer = http.createServer(redirectApp);
        this.logger.log('HTTP server with redirect to https server created', 'debug');
        
        this.httpServer.listen(httpPort, () => {
          this.logger.log(`HTTP server is listening on port ${httpPort}`, 'info');
          resolve();
        });
      });
    });
  }

  
  private initializeGraphQLApi(useGraphiql: boolean, graphqlEndpoint: string, graphiqlEndpoint: string) {
    this.logger.log('Start initializing graphql api', 'debug');

    const schemaTypes = importSchema(__dirname + '/api/schema/schema.graphql');
    this.logger.log('GraphQL schema successfully read', 'debug');

    const schema = makeExecutableSchema({ resolvers, typeDefs: schemaTypes });
    this.logger.log('Graphql schema created', 'debug');

    this.app.use(graphqlEndpoint, graphqlExpress({ schema, formatError }));
    this.logger.log(`Graphql is listening on URL: ${graphqlEndpoint}`, 'debug');

    if (useGraphiql) {
      this.app.use(graphiqlEndpoint,  graphiqlExpress({ endpointURL: graphqlEndpoint }));
      this.logger.log('Graphql fully initialized', 'debug');
    }

    this.logger.log(`Graphiql is listening on URL: ${graphiqlEndpoint}`, 'debug');
  }

  
}
