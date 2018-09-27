import * as express from 'express';

import { container } from '../../../inversify.config';
import { TYPES } from '../../../types';

import { sendData } from '../utils/sendData';
import { sendError } from '../utils/sendError';

import { IAuthentificationService } from '../../../interfaces/services/IAuthentificatonService';
import { ILogger } from '../../../interfaces/services/ILogger';
import { SignupNotAvailableError } from '../../../error/auth/SignupNotAvailableError';


/**
 * @function
 * @author Stefan Läufle
 * 
 * Callback function for REST signup route.
 * Function will try to signup the user and to
 * automatically log in the user by returning
 * a valid JSON web token.
 * 
 * The function will also return the created
 * user information
 * 
 * @param {Request} req  The express request object
 * @param {Response} res The express response object
 */
export async function signup(req: express.Request, res: express.Response) {
  const authService = container.get<IAuthentificationService>(TYPES.AuthentificationService);
  const logger = container.get<ILogger>(TYPES.Logger);

  try {
    const signupAllowed = await authService.getSignupAvailable();
    if (!signupAllowed) {
      logger.debug('Signup tried by user, but that is not allowed');
      
      const err = new SignupNotAvailableError('Signup not allowed by configuration');
      logger.warn(err);

      throw err;
    }

    const user = await authService.signup({ ...req.body });
    res.status(201).json(sendData(user));
  } catch (err) {
    res.status(err.code || 500).json(sendError(err));
  }
}
