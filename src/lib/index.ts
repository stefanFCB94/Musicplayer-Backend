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

// start();

async function test() {
  await initEventListener();
  
  const reader = container.get<ILibraryReaderService>(TYPES.LibraryReaderService);
  await reader.setLibraryPaths([
    'C:/Users/stefan/Documents/Musicplayer/Library/Test 1',
    'C:/Users/stefan/Documents/Musicplayer/Library/Test 2',
  ]);

  const files = await reader.getAllFilesInLibraryPaths();
  console.log(files);

  process.exit(0);
}

test();
