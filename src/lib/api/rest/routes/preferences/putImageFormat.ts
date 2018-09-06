import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IImageProcessingService } from '../../../../interfaces/services/IImageProcessingService';
import { sendError } from '../../utils/sendError';


export async function putImageFormat(req: express.Request, res: express.Response) {
  const imageProcessing = container.get<IImageProcessingService>(TYPES.ImageProcessingService);

  try {
    if (!req.body || typeof req.body.format === 'undefined') {

    }

    const format: string = req.body.format;
    await imageProcessing.setFormat(format);

    res.status(204).send();
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }
}
