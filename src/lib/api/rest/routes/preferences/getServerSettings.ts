import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

import { IServer } from '../../../../interfaces/IServer';
import { ServerPreferencesEnum } from '../../../../enums/preferences/ServerPreferencesEnum';

export async function getServerSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  
  const server = container.get<IServer>(TYPES.Server);
  const option = req.params.option;

  try {
    let data: any;
    switch (option) {

      case ServerPreferencesEnum.HTTP_PORT: {
        data = await server.getHttpPort();
        break;
      }

      case ServerPreferencesEnum.HTTPS_PORT: {
        data = await server.getHttpsPort();
        break;
      }

      case ServerPreferencesEnum.USE_HTTPS: {
        data = await server.getUseHttps();
        break;
      }

      case ServerPreferencesEnum.PRIVATE_KEY: {
        data = await server.getPrivateKeyPath();
        break;
      }

      case ServerPreferencesEnum.CERTIFICATE: {
        data = await server.getCertificatePath();
        break;
      }

      case ServerPreferencesEnum.GRAPHQL_ENDPOINT: {
        data = await server.getGraphQlEndpoint();
        break;
      }

      case ServerPreferencesEnum.GRAPHIQL_ENDPOINT: {
        data = await server.getGraphiQlEndpoint();
        break;
      }

      case ServerPreferencesEnum.USE_GRAPHIQL: {
        data = await server.getUseGraphiQl();
        break;
      }

      case ServerPreferencesEnum.REST_ENDPOINT: {
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
