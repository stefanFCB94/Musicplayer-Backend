import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { IJWTGenerator } from '../../../../interfaces/services/IJWTGenerator';
import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';

export async function getSecuritySettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  const jwtGenerator = container.get<IJWTGenerator>(TYPES.JWTGenerator);
  const option = req.params.option;

  let data: any;

  try {
    switch (option) {
      case 'SECURITY.JWT.ALGORITHM': {
        data = await jwtGenerator.getAlgorithm();
        break;
      }

      case 'SECURITY.JWT.EXPIRES': {
        data = await jwtGenerator.getExpiresIn();
        break;
      }

      case 'SECURITY.JWT.SECRET': {
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
