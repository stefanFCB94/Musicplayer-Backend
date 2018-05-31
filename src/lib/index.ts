import 'reflect-metadata';

import { container } from './inversify.config';
import { TYPES } from './types';
import { IServer } from './interfaces/IServer';


async function start() {
  const server = container.get<IServer>(TYPES.Server);

  try {
    await server.start();

    process.on('SIGINT', () => server.stop());
  } catch (err) {}
}

start();
