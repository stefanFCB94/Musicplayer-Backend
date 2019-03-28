import * as express from 'express';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import * as compression from 'compression';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs-extra';

import { Logger } from './services/Logger.service';
import { LogLevel } from './enums/LogLevel';


export class Server {

  private app: express.Application;
  private httpServer: http.Server;
  private httpsServer: https.Server;

  private httpPort: number;
  private httpsPort: number;
  private useHttps: boolean;
  private certificate: string;
  private privateKey: string;


  private logger: Logger;

  constructor(logger: Logger) {
    this.httpPort = 80;
    this.httpsPort = 443;

    this.useHttps = config.get('USE_HTTPS') || false;

    this.certificate = config.get('CERTIFICATE_PATH');
    this.privateKey = config.get('PRIVATE_KEY_PATH');

    this.logger = logger;
  }


  public async init() {
    this.logger.log('__AUTH-START__', 'Start to initialize all services for server', LogLevel.DEBUG);


    this.logger.log('__AUTH-START__', 'Initializing of all services of the server finished', LogLevel.DEBUG);
  }



  public async start() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());

    this.initializeApi();
    this.logger.log('__AUTH-START__', 'Start server...', LogLevel.DEBUG);


    if (this.useHttps) {
      await this.startHTTPS();
    } else {
      await this.startHTTP();
    }

    this.logger.log('__AUTH-START__', 'Server succesfully started', LogLevel.DEBUG);
  }

  public async stop() {
    this.logger.log('__AUTH-STOP__', 'Stopping server...', LogLevel.DEBUG);

    await this.stopHttp();
    await this.stopHttps();
  }


  private initializeApi() {
    this.logger.log('__AUTH-START__', 'Start to initialize routes of the server', LogLevel.DEBUG);

    this.logger.log('__AUTH-START__', 'Routes of the server successfully initialized', LogLevel.DEBUG);
  }


  private async startHTTP() {
    await this.stopHttp();

    return new Promise<void>((resolve) => {
      this.httpServer = http.createServer(this.app);
      this.httpServer.listen(this.httpPort, () => {
        this.logger.log('__AUTH-START__', `HTTP-Server successfully started on port ${this.httpPort}`, LogLevel.INFO);
        resolve();
      });
    });
  }

  private async startHTTPS() {
    await this.stopHttp();
    await this.stopHttps();

    return new Promise<void>(async (resolve) => {
      const key = await fs.readFile(this.privateKey);
      const cert = await fs.readFile(this.certificate);

      const options: https.ServerOptions = { key, cert };

      await this.startHTTPRedirect();

      this.httpsServer = https.createServer(options, this.app);
      this.httpsServer.listen(this.httpsPort, () => {
        this.logger.log('__AUTH-START__', `HTTPS-Server successfully started on port ${this.httpsPort}`, LogLevel.INFO);
        resolve();
      });

    });
  }

  private async startHTTPRedirect() {
    await this.stopHttp();

    const redirectApp = express();
    redirectApp.all('*', (req, res) => {
      const host = req.headers.host.split(':')[0];
      const url = `https://${host}:${this.httpsPort}${req.url}`;
      res.redirect(url);
    });

    this.httpServer = http.createServer(redirectApp);

    return new Promise<void>((resolve) => {
      this.httpServer.listen(this.httpPort, () => {
        this.logger.log('__AUTH-START__', `HTTP-Server started on port ${this.httpPort}`, LogLevel.INFO);
        this.logger.log('__AUTH-START__', 'All HTTP requests will be redirected to the HTTPS server', LogLevel.INFO);

        resolve();
      });
    });
  }


  private stopHttp() {
    return new Promise<void>((resolve) => {
      if (this.httpsServer) {
        this.httpServer.close(() => {

          this.httpServer = null;
          this.logger.log('__AUTH-STOP__', 'HTTP-Server successfully stopped', LogLevel.INFO);

          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private stopHttps() {
    return new Promise<void>((resolve) => {
      if (this.httpsServer) {
        this.httpsServer.close(() => {

          this.httpsServer = null;
          this.logger.log('__AUTH-STOP__', 'HTTPS-Server successfully stopped', LogLevel.INFO);

          resolve();
        });
      } else {
        resolve();
      }
    });
  }

}

