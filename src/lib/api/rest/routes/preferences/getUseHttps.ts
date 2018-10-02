import * as express from 'express';
import { container } from '../../../../inversify.config';
import { IServer } from '../../../../interfaces/IServer';
import { TYPES } from '../../../../types';
import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getUseHttps(req: express.Request, res: express.Response) {
  const server = container.get<IServer>(TYPES.Server);

  try {
    const useHttps = await server.getUseHttps();
    res.status(200).json(sendData(useHttps));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }
}
