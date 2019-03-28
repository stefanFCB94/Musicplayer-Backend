process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'reflect-metadata';


import { LogLevel } from './enums/LogLevel';
import { Logger } from './services/Logger.service';
import { Server } from './server';
import { DatabaseService } from './database/database.service';


let logger: Logger;
let database: DatabaseService;
let server: Server;


async function startMicroservice() {
  logger = new Logger();
  await logger.log('__AUTH-START__', 'Start microservice...', LogLevel.INFO);

  database = new DatabaseService(logger);
  await database.connect();

  server = new Server(logger);
  await server.start();
}

async function stopMicroservice() {
  await logger.log('__AUTH-STOP__', 'Stop microservice...', LogLevel.INFO);

  await database.disconnect();
  await server.stop();

  await logger.log('__AUTH-STOP__', 'Microservice successfully stopped', LogLevel.INFO);
  await logger.closeServiceLogFile();

  setTimeout(() => process.exit(0), 1000);
}


startMicroservice();

process.on('SIGINT', async () => {
  await stopMicroservice();
});

