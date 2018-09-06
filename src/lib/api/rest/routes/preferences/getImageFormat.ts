import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IImageProcessingService } from '../../../../interfaces/services/IImageProcessingService';
import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getImageFormat(req: express.Request, res: express.Response) {
  const imageService = container.get<IImageProcessingService>(TYPES.ImageProcessingService);

  try {
    const format = await imageService.getFormat();
    res.status(200).json(sendData(format));
  } catch (error) {
    res.status(error.code || 500).json(sendError(error));
  }
}
