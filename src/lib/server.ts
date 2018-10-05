import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as bodyParser from 'body-parser';
import * as fs from 'fs-extra';
import * as compression from 'compression';
import * as helmet from 'helmet';

import { BaseSystemPreferenceService } from './base/BaseSystemPreferenceService';
import { ISystemPreferencesService } from './interfaces/services/ISystemPreferencesService';
import { ILogger } from './interfaces/services/ILogger';
import { IServer } from './interfaces/IServer';

import { inject, injectable } from 'inversify';
import { TYPES } from './types';

import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { ServerPreferencesEnum } from './enums/preferences/ServerPreferencesEnum';

import { resolvers } from './api/resolvers/resolvers';
import { formatError } from './api/resolvers/errors/formatError';

import { CertificateNotFoundError } from './error/server/CertificateNotFoundError';
import { CertificateNotAFileError } from './error/server/CertificateNotAFileError';
import { CertificateNotReadableError } from './error/server/CertificateNotReadableError';
import { PrivateKeyNotAFileError } from './error/server/PrivateKeyNotAFileError';
import { PrivateKeyNotFoundError } from './error/server/PrivateKeyNotFoundError';
import { PrivateKeyNotReadableError } from './error/server/PrivateKeyNotReadableError';
import { RequiredConfigParameterNotSetError } from './error/config/RequiredConfigParamterNotSetError';
import { createApi } from './api/rest';


/**
 * @class
 * 
 * Class, which creates a HTTP and HTTPS server, which is used for
 * the GraphQL and REST endpoints.
 * 
 * The class has basic functionalities to create, start and stop a
 * HTTP and HTTPS server. Furthermore the class has functions to set
 * and get the options, which are used to create the server.
 */

@injectable()
export class Server extends BaseSystemPreferenceService implements IServer {

  private app: express.Application;

  private httpServer: http.Server;
  private httpsServer: https.Server;


  constructor(
    @inject(TYPES.SystemPreferencesService) systemPreferenceService: ISystemPreferencesService,
  ) {
    super(systemPreferenceService);

    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.HTTP_PORT, [3000]);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.HTTPS_PORT, [3001]);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.USE_HTTPS, [false]);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.GRAPHQL_ENDPOINT, ['/graphql']);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.GRAPHIQL_ENDPOINT, ['/graphiql']);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.USE_GRAPHIQL, [true]);
    this.systemPreferenceService.setDefaultValue(ServerPreferencesEnum.REST_ENDPOINT, ['/rest']);

    this.systemPreferenceService.setAllowedValues(ServerPreferencesEnum.USE_HTTPS, [true, false]);
    this.systemPreferenceService.setAllowedValues(ServerPreferencesEnum.USE_GRAPHIQL, [true, false]);

    this.systemPreferenceService.setCheckFunction(ServerPreferencesEnum.HTTP_PORT, this.isValidPort);
    this.systemPreferenceService.setCheckFunction(ServerPreferencesEnum.HTTPS_PORT, this.isValidPort);
    this.systemPreferenceService.setCheckFunction(ServerPreferencesEnum.GRAPHQL_ENDPOINT, this.isValidEndpoint);
    this.systemPreferenceService.setCheckFunction(ServerPreferencesEnum.GRAPHIQL_ENDPOINT, this.isValidEndpoint);
    this.systemPreferenceService.setCheckFunction(ServerPreferencesEnum.REST_ENDPOINT, this.isValidEndpoint);
  }


  /**
   * @private
   * @async 
   *
   * Checks, if value is valid port number to run the socket on.
   * Valid ports are all ports form 1025 to 65535.
   * 
   * @param {number} port The value to check
   * @returns {Promise<boolean>} The check result
   * 
   * @throws {InvalidConfigValueError}
   */
  private async isValidPort(port: number): Promise<boolean> {
    if (typeof port !== 'number') {
      return false;
    }

    if (port <= 1024 || port > 65535) {
      return false;
    }

    return true;
  }

  /**
   * @private
   * @async
   * 
   * Check if a parameter is a valid endpoint
   * Each endpoint must start with slash
   * 
   * @param {string} endpoint The parameter to check
   * @returns {Promise<boolean>} The result
   * 
   * @throws {InvalidConfigValueError}
   */
  private async isValidEndpoint(endpoint: string): Promise<boolean> {
    if (typeof endpoint !== 'string') {
      return false;
    }

    return /^\//.test(endpoint);
  }


  /**
   * @public
   * @async
   * 
   * Get the currently use port number, which is used for the HTTP server
   * 
   * @returns {Promise<number>} The used port number
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getHttpPort(): Promise<number> {
    const port = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.HTTP_PORT);

    if (!port || port.length === null) {
      return null;
    }
    
    return port[0];
  }

  /**
   * @public
   * @async
   * 
   * Get the currently used port, which is used for the HTTPS server
   * 
   * @returns {Promise<number>} The used port number
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getHttpsPort(): Promise<number> {
    const port = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.HTTPS_PORT);

    if (!port || port.length === 0) {
      return null;
    }

    return port[0];
  }

  /**
   * @public
   * @async
   * 
   * Get, if the HTTPS server is used.
   * 
   * @returns {Promise<boolean>} If the server is used
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getUseHttps(): Promise<boolean> {
    const useHTTPS = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.USE_HTTPS);

    if (!useHTTPS || useHTTPS.length === 0) {
      return null;
    }

    return useHTTPS[0];
  }

  /**
   * @public
   * @async
   * 
   * Get if the graphical user interface endpoint is used
   * 
   * @returns {Promise<boolean>} If the graphical user interface is served
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getUseGraphiQl(): Promise<boolean> {
    const useGraphiql = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.USE_GRAPHIQL);

    if (!useGraphiql || useGraphiql.length === 0) {
      return null;
    }

    return useGraphiql[0];
  }
  
  /**
   * @public
   * @async
   * 
   * Get the currently used GraphQl endpoint
   * 
   * @returns {Promise<string>} The used endpoint
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getGraphQlEndpoint(): Promise<string> {
    const endpoint = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.GRAPHQL_ENDPOINT);

    if (!endpoint || endpoint.length === 0) {
      return null;
    }

    return endpoint[0];
  }

  /**
   * @public
   * @async
   * 
   * Get the currently used endpoint for the graphical user
   * inteface of the GraphQL API
   * 
   * @returns {Promise<string>} The use endpoint
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getGraphiQlEndpoint(): Promise<string> {
    const endpoint = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.GRAPHIQL_ENDPOINT);

    if (!endpoint || endpoint.length === 0) {
      return null;
    }

    return endpoint[0];
  }

  /**
   * @public
   * @async
   * 
   * Get the currently REST endpoint
   * 
   * @returns {Promise<string>} The used enpoint
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getRestEndpoint(): Promise<string> {
    const endpoint = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.REST_ENDPOINT);
    
    if (!endpoint || endpoint.length === 0) {
      return null;
    }

    return endpoint[0];
  }

  /**
   * @public
   * @async
   * 
   * Get the currently set path to the certificate, which
   * is used for the HTTPS server
   * 
   * @returns {Promise<string>} The used certificate path
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error} 
   */
  public async getCertificatePath(): Promise<string> {
    const path = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.CERTIFICATE);

    if (!path || path.length === 0) {
      return null;
    }
    
    return path[0];
  }

  /**
   * @public
   * @async
   * 
   * Get the currently used path tot he private key file, which
   * is used for the HTTPS server
   * 
   * @returns {Promise<string>} The used path for the private key
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getPrivateKeyPath(): Promise<string> {
    const path = await this.systemPreferenceService.getPreferenceValues(ServerPreferencesEnum.PRIVATE_KEY);

    if (!path || path.length === 0) {
      return null;
    }

    return path[0];
  }


  /**
   * @public
   * @async
   * 
   * Set, if the HTTPS server is used.
   * Changes takes effect after a server restart
   * 
   * @param {boolean} useHTTPS If the HTTPS server is used
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setUseHttps(useHTTPS: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.USE_HTTPS, [useHTTPS]);
  }

  /**
   * @public
   * @async
   * 
   * Set, if the the graphical user interface for the GraphQL
   * endpoint should be served.
   * Changes take effect after a server restart
   * 
   * @param {boolean} useGraphiQl If the GUI for the GraphQl server is served
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setUseGraphiQl(useGraphiQl: boolean): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.USE_GRAPHIQL, [useGraphiQl]);
  }

  /**
   * @public
   * @async
   * 
   * Set the port, which should be used for the HTTP server
   * 
   * @param {number} port The port for the HTTP server
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error} 
   */
  public async setHttpPort(port: number): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.HTTP_PORT, [port]);
  }

  /**
   * @public
   * @async
   * 
   * Set the port, which is used for the HTTPS server.
   * Changes take effect after a server restart
   * 
   * @param {number} port The port number
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setHttpsPort(port: number): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.HTTPS_PORT, [port]);
  }

  /**
   * @public
   * @async
   * 
   * Set the endpoint, on which the GraphQL endpoint is served.
   * Changes take effect after a server restart.
   * 
   * @param {string} endpoint The new endpoint
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setGraphQlEndpoint(endpoint: string): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.GRAPHQL_ENDPOINT, [endpoint]);
  }

  /**
   * @public
   * @async
   * 
   * Set the endpoint, on which the graphical client for the
   * GraphQL API is served.
   * Changes take effect after a server restart
   * 
   * @param {string} endpoint The new endpoint
   * @returns {Promise<string>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error} 
   */
  public async setGraphiQlEndpoint(endpoint: string): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.GRAPHIQL_ENDPOINT, [endpoint]);
  }

  /**
   * @public
   * @async
   * 
   * Set the endpoint, on which the rest API is served.
   * Changes take effect after a server restart.
   * 
   * @param {string} endpoint The new endpoint
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setRestEndpoint(endpoint: string): Promise<void> {
    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.REST_ENDPOINT, [endpoint]);
  }

  /**
   * @public
   * @async
   * 
   * Set the path to the certificate, which is needed for the HTTPS server
   * 
   * @param {string} path The path to the certificate file
   * @returns {Promise<void>}
   * 
   * @throws {CertificateNotAFileError}
   * @throws {CertificateNotFoundError}
   * @throws {CertificateNotReadableError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error} 
   */
  public async setCertificatePath(path: string): Promise<void> {
    try {
      const stats = await fs.stat(path);
      if (!stats.isFile()) {
        const error = new CertificateNotAFileError(path, 'Certificate is a directory and not a file');
        this.logger.error(error);

        throw error;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        const error = new CertificateNotFoundError(path, 'Certificate not found');
        this.logger.error(error);

        throw error;
      }

      this.logger.debug('Unknown error occured, by stating the certificate file');
      this.logger.error(err);
      throw err;
    }

    try {
      const access = await fs.access(path, fs.constants.R_OK);
    } catch (err) {
      const error = new CertificateNotReadableError(path, 'No permission to read certificate file');
      this.logger.error(error);

      throw error;
    }

    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.CERTIFICATE, [path]);
  }

  /**
   * @public
   * @async
   * 
   * Set the path to the private key, which is used for the HTTPS server.
   * Changes take effect after as server restart.
   * 
   * @param {string} path The path to the private key
   * @returns {Promise<void>}
   * 
   * @throws {PrivateKeyNotAFileError}
   * @throws {PrivateKeyNotFoundError}
   * @throws {PrivateKeyNotReadableError}
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error} 
   */
  public async setPrivateKeyPath(path: string): Promise<void> {
    try {
      const stats = await fs.stat(path);
      if (!stats.isFile()) {
        const error = new PrivateKeyNotAFileError(path, 'Private key is a directory and not a file');
        this.logger.error(error);

        throw error;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        const error = new PrivateKeyNotFoundError(path, 'Private key not found');
        this.logger.error(error);

        throw error;
      }

      this.logger.debug('Unknown error occured, by stating the private key file');
      this.logger.error(err);
      throw err;
    }

    try {
      const access = await fs.access(path, fs.constants.R_OK);
    } catch (err) {
      const error = new PrivateKeyNotReadableError(path, 'No permission to read certificate file');
      this.logger.error(error);

      throw error;
    }

    await this.systemPreferenceService.savePreference(ServerPreferencesEnum.PRIVATE_KEY, [path]);
  }



  /**
   * @public
   * @async
   * 
   * Start the server.
   * The config for the server is read from the server
   * system preference service.
   * 
   * @return {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {RequiredConfigParameterNotSetError}
   * @throws {Error}
   */
  public async start(): Promise<void> {
    const useHTTPS = await this.getUseHttps();
    const portHTTP = await this.getHttpPort();
    const useGraphiQl = await this.getUseGraphiQl();
    const graphqlEndpoint = await this.getGraphQlEndpoint();
    const graphiqlEndpoint = await this.getGraphiQlEndpoint();
    const restBaseEndpoint = await this.getRestEndpoint();

    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());

    this.initializeGraphQLApi(useGraphiQl, graphqlEndpoint, graphiqlEndpoint);
    this.initalizeRestApi(restBaseEndpoint);


    if (useHTTPS) {
      const portHTTPS = await this.getHttpsPort();   

      const certPath = await this.getCertificatePath();
      if (!certPath) {
        const error = new RequiredConfigParameterNotSetError(ServerPreferencesEnum.CERTIFICATE, 'Certificate for HTTPS server is not defined');
        this.logger.error(error);
        throw error;
      }
      
      const privateKeyPath = await this.getPrivateKeyPath();
      if (!privateKeyPath) {
        const error = new RequiredConfigParameterNotSetError(ServerPreferencesEnum.PRIVATE_KEY, 'Private key for HTTPS server is not defined');
        this.logger.error(error);
        throw error;
      }

      await this.startHTTPS(portHTTPS, portHTTP, privateKeyPath, certPath);
    } else {
      await this.startHTTP(portHTTP);
    }
  }

  /**
   * @public
   * @async
   * 
   * Stops the server.
   * Stops all started servers, the HTTPS and the HTTP server
   * if started.
   * 
   * @returns {Promise<void>}
   * 
   * @throws {Error}
   */
  public async stop(): Promise<void> {
    const stopHTTPS = () => new Promise<void>((resolve) => {
      this.logger.debug('Shutting down HTTPS server');
      this.httpsServer.close(() => resolve());
    });

    const stopHTTP = () => new Promise<void>((resolve) => {
      this.logger.debug('Shutting down HTTP server');
      this.httpServer.close(() => resolve());
    });


    if (this.httpsServer) {
      await stopHTTPS();
      this.httpsServer = null;

      this.logger.debug('HTTPS server was shut down');
    }

    if (this.httpServer) {
      await stopHTTP();
      this.httpServer = null;

      this.logger.debug('HTTP server was shut down');
    }

    this.app = null;
    this.logger.info('Server successfully shut down');
  }

  /**
   * @public
   * @async
   * 
   * Restarts the server by stopping and starting the
   * server.
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {RequiredConfigParameterNotSetError}}
   * @throws {Error}
   */
  public async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }



  /**
   * @private
   * @async
   * 
   * Read the certificate file from the file system
   * 
   * @param {string} file The file to the certificate file
   * @returns {Promise<string>} The read file
   * 
   * @throws {Error} 
   */
  private async readFile(file: string): Promise<string> {
    this.logger.debug('Start reading the the file from the file system');

    const data = await fs.readFile(file, 'utf8');

    this.logger.debug('File successfully read');
    return data;
  }



  /**
   * @private
   * @async
   * 
   * Start the HTTP server on the port, passed to the function
   * 
   * @param {number} port The port, on which the server should start
   * @returns {Promise<void>}
   * 
   * @throws {Error} 
   */
  private async startHTTP(port: number): Promise<void> {
    this.logger.debug('Start http server');

    if (this.httpServer) {
      this.logger.debug('HTTP server could not be started, because it is already running');
      return;
    }

    this.httpServer = http.createServer(this.app);
    this.logger.debug('HTTP server is created');

    return new Promise<void>((resolve, reject) => {
      this.httpServer.listen(port, () => {
        this.logger.info(`Server is listening on port ${port}`);
        resolve();
      });
    });
  }

  /**
   * @private
   * @async
   * 
   * Start a HTTPS server on the port, which is passed in to the function.
   * HTTPs server also creates a redirect from the HTTP server to the HTTPS
   * server.
   * 
   * To create the server the path to the certificate and the private key
   * is required
   * 
   * @param {number} httpsPort The port for the HTTPS server
   * @param {number} httpPort The port of the HTTP server
   * @param {string} privateKeyPath Path to the private key
   * @param {string} certPath Path to the certificate
   * 
   * @returns {Promise<void>}
   * 
   * @throws {Error}
   */
  private async startHTTPS(httpsPort: number, httpPort: number, privateKeyPath: string, certPath: string): Promise<void> {
    let key: string;
    let cert: string;

    try {
      cert = await this.readFile(certPath);
      key = await this.readFile(privateKeyPath);  
    } catch (err) {
      throw err;
    }

    this.logger.debug('Certificate and private key loaded');

    const httpsOptions: https.ServerOptions = { key, cert };

    this.httpsServer = https.createServer(httpsOptions, this.app);
    this.logger.debug('HTTPS server created');

    return new Promise<void>((resolve, reject) => {
      this.httpsServer.listen(httpsPort, () => {
        this.logger.info(`HTTPS server is listening on port ${httpsPort}`);

        const redirectApp = express();
        redirectApp.all('*', (req, res) => {
          const url = `https://${req.headers.host}:${httpsPort}${req.url}`;
          res.redirect(url, 307);
        });

        this.httpServer = http.createServer(redirectApp);
        this.logger.debug('HTTP server with redirect to https server created');
        
        this.httpServer.listen(httpPort, () => {
          this.logger.info(`HTTP server is listening on port ${httpPort}`);
          resolve();
        });
      });
    });
  }

  
  /**
   * @private
   * 
   * Initalize the GraphQL endpoint for the app.
   * The endpoint is used for the HTTP and HTTPS server.
   * 
   * @param {boolean} useGraphiql If the graphical user interface should be used 
   * @param {string} graphqlEndpoint The GraphQL endpoint 
   * @param {string} graphiqlEndpoint The GraphiQL endpoint
   * 
   * @returns {void}
   * 
   * @throws {Error}
   */
  private initializeGraphQLApi(useGraphiql: boolean, graphqlEndpoint: string, graphiqlEndpoint: string): void {
    this.logger.debug('Start initializing graphql api');

    const schemaTypes = importSchema(__dirname + '/api/schema/schema.graphql');
    this.logger.debug('GraphQL schema successfully read');

    const schema = makeExecutableSchema({ resolvers, typeDefs: schemaTypes });
    this.logger.debug('Graphql schema created');

    this.app.use(graphqlEndpoint, graphqlExpress({ schema, formatError }));
    this.logger.debug(`Graphql is listening on URL: ${graphqlEndpoint}`);

    if (useGraphiql) {
      this.app.use(graphiqlEndpoint,  graphiqlExpress({ endpointURL: graphqlEndpoint }));
      this.logger.debug('Graphql fully initialized');
    }

    this.logger.debug(`Graphiql is listening on URL: ${graphiqlEndpoint}`);
  }

  /**
   * @private
   * 
   * Initialize the rest API.
   * The endpoint is used for the HTTP and HTTPS server.
   * 
   * @param {string} endpoint The base endpoint for the rest API
   * @returns {void}
   * 
   * @throws {Error}
   */
  private initalizeRestApi(endpoint: string): void {
    this.logger.debug('Initalize REST api');

    const router = createApi();
    this.app.use(endpoint, router);

    this.logger.debug('REST api completly initialized');
  }

  
}
