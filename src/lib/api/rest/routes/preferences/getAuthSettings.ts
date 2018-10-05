import * as express from 'express';

import { IAuthentificationService } from '../../../../interfaces/services/IAuthentificatonService';
import { IJWTGenerator } from '../../../../interfaces/services/IJWTGenerator';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

export async function getAuthSetting(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authService = container.get<IAuthentificationService>(TYPES.AuthentificationService);
  const jwtGenerator = container.get<IJWTGenerator>(TYPES.JWTGenerator);

  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case 'SIGNUP.POSSIBLE': {
        data = await authService.getSignupAvailable();
        break;
      }

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

    res.status(200).json(sendData(data));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }
}
