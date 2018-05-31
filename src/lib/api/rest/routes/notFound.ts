import * as express from 'express';
import { RouteNotFoundError } from '../../../error/request/RouteNotFoundError';
import { sendError } from '../utils/sendError';

/**
 * @function
 * @author Stefan Läufle
 * 
 * Not found route for the rest api.
 * Returns a custom error, which shows, that the
 * requested rest route could not be found on the
 * server.
 * 
 * The function responses with a 404 error
 * 
 * @param {Request}  req The express request object
 * @param {Response} res The express response object 
 */
export function notFoundRoute(req: express.Request, res: express.Response) {
  const error = new RouteNotFoundError(req.baseUrl + req.url, req.method, 'Route is not defined');
  res.status(error.code).json(sendError(error));
}
