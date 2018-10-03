import * as express from 'express';

import { container } from '../../../../inversify.config';
import { IServer } from '../../../../interfaces/IServer';
import { TYPES } from '../../../../types';

import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getPrivateKey(req: express.Request, res: express.Response) {
  const server = container.get<IServer>(TYPES.Server);

  try {
    const key = await server.getPrivateKeyPath();
    res.status(200).json(sendData(key));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }

}
