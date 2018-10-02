import * as express from 'express';

import { container } from '../../../../inversify.config';
import { IServer } from '../../../../interfaces/IServer';
import { TYPES } from '../../../../types';
import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

export async function getHttpPort(req: express.Request, res: express.Response) {
  const server = container.get<IServer>(TYPES.Server);

  try {
    const port = await server.getHttpPort();
    res.status(200).json(sendData(port));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }

}
