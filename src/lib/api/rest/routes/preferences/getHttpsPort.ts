import * as express from 'express';
import { container } from '../../../../inversify.config';
import { IServer } from '../../../../interfaces/IServer';
import { TYPES } from '../../../../types';
import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getHttpsPort(req: express.Request, res: express.Response) {
  const server = container.get<IServer>(TYPES.Server);

  try {
    const port = await server.getHttpsPort();
    res.status(200).json(sendData(port));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }
}
