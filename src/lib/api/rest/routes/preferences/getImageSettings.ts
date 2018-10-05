import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IImageProcessingService } from '../../../../interfaces/services/IImageProcessingService';
import { ImagePreferencesEnum } from '../../../../enums/preferences/ImagePreferencesEnum';

import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';


export async function getImageSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  
  const imageService = container.get<IImageProcessingService>(TYPES.ImageProcessingService);
  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case ImagePreferencesEnum.FORMAT: {
        data = await imageService.getFormat();
        break;
      }

      default: {
        return next();
      }
    }

    return res.status(200).json(sendData(data));
  } catch (error) {
    return res.status(error.code || 500).json(sendError(error));
  }
}
