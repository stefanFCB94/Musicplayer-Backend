import 'reflect-metadata';

import { container } from './inversify.config';
import { TYPES } from './types';
import { IServer } from './interfaces/IServer';
import { ILoggerListenerService } from './interfaces/services/ILoggerListenerService';
import { ILibraryReaderService } from './interfaces/services/ILibraryReaderService';


async function initEventListener() {
  const loggerListenerService = container.get<ILoggerListenerService>(TYPES.LoggerListenerService);
  await loggerListenerService.init();
}

async function start() {
  try {
    await initEventListener();
    const server = container.get<IServer>(TYPES.Server);
  
    await server.start();

    process.on('SIGINT', () => {
      server.stop();
      process.exit(0);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
