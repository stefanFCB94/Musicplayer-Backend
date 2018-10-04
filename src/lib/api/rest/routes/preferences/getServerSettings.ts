import * as express from 'express';
import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';
import { container } from '../../../../inversify.config';
import { IServer } from '../../../../interfaces/IServer';
import { TYPES } from '../../../../types';

export async function getServerSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  
  const server = container.get<IServer>(TYPES.Server);
  const option = req.params.option;

  try {
    let data: any;
    switch (option) {

      case 'SERVER.HTTP_PORT': {
        data = await server.getHttpPort();
        break;
      }

      case 'SERVER.HTTPS_PORT': {
        data = await server.getHttpsPort();
        break;
      }

      case 'SERVER.USE_HTTPS': {
        data = await server.getUseHttps();
        break;
      }

      case 'SERVER.PRIVATE_KEY': {
        data = await server.getPrivateKeyPath();
        break;
      }

      case 'SERVER.CERTIFICATE': {
        data = await server.getCertificatePath();
        break;
      }

      case 'SERVER.GRAPHQL_ENDPOINT': {
        data = await server.getGraphQlEndpoint();
        break;
      }

      case 'SERVER.GRAPHIQL_ENDPOINT': {
        data = await server.getGraphiQlEndpoint();
        break;
      }

      case 'SERVER.GRAPHIQL_ACTIVE': {
        data = await server.getUseGraphiQl();
        break;
      }

      case 'SERVER.REST_ENDPOINT': {
        data = await server.getRestEndpoint();
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
