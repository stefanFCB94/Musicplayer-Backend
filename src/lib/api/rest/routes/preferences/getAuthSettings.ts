import * as express from 'express';

import { IAuthentificationService } from '../../../../interfaces/services/IAuthentificatonService';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

export async function getAuthSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authService = container.get<IAuthentificationService>(TYPES.AuthentificationService);
  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case 'SIGNUP.POSSIBLE': {
        data = await authService.getSignupAvailable();
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
