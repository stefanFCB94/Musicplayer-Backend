import * as express from 'express';

import { container } from '../../../inversify.config';
import { TYPES } from '../../../types';

import { sendData } from '../utils/sendData';
import { sendError } from '../utils/sendError';

import { IAuthentificationService } from '../../../interfaces/services/IAuthentificatonService';


/**
 * @function
 * @author Stefan Läufle
 * 
 * Callback function for REST login route.
 * Function will try to log the user in and to create
 * as jwt through the authentification service.
 * 
 * @param {Request}  req The express request object 
 * @param {Response} res The express response object
 * 
 * @returns {void} Do not return a value
 */
export async function loginRoute(req: express.Request, res: express.Response): Promise<void> {
  const authService = container.get<IAuthentificationService>(TYPES.AuthentificationService);

  try {
    const jwt = await authService.login(req.body.mail, req.body.password);
    res.status(200).json(sendData({ jwt }));
  } catch (err) {
    res.status(err.code).json(sendError(err));
  }
}
