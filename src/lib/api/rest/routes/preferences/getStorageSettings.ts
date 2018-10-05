import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IStorageService } from '../../../../interfaces/services/IStorageService';

import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

import { StoragePreferenceEnum } from '../../../../enums/preferences/StoragePreferenceEnum';

export async function getStorageSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  const storageService = container.get<IStorageService>(TYPES.StorageService);
  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case StoragePreferenceEnum.STORAGE_PATH: {
        data = await storageService.getBaseStorage();
        break;
      }

      default: {
        return next();
      }
    }

    res.status(200).json(sendData(data));
  } catch (err) {
    res.status(err.status || 500).json(sendError(err));
  }
}
