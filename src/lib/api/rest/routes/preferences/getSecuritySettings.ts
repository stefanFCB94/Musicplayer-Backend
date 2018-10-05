import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IJWTGenerator } from '../../../../interfaces/services/IJWTGenerator';
import { SecurityPreferencesEnum } from '../../../../enums/preferences/SecurityPreferencesEnum';

import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getSecuritySettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  const jwtGenerator = container.get<IJWTGenerator>(TYPES.JWTGenerator);
  const option = req.params.option;

  let data: any;

  try {
    switch (option) {
      case SecurityPreferencesEnum.JWT_ALGORITHM: {
        data = await jwtGenerator.getAlgorithm();
        break;
      }

      case SecurityPreferencesEnum.JWT_EXPIRES_IN: {
        data = await jwtGenerator.getExpiresIn();
        break;
      }

      case SecurityPreferencesEnum.JWT_SECRET_KEY: {
        data = await jwtGenerator.getSecretKey();
        break;
      }

      default: {
        return next();
      }
    }

    return res.status(200).json(sendData(data));
  } catch (err) {
    return res.status(err.code || 500).json(sendError(err));
  }
}
