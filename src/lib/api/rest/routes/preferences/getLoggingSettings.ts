import * as express from 'express';

import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../types';

import { ILoggerListenerService } from '../../../../interfaces/services/ILoggerListenerService';
import { LoggingPreferencesEnum } from '../../../../enums/preferences/LoggingPreferencesEnum';

import { sendError } from '../../utils/sendError';
import { sendData } from '../../utils/sendData';

export async function getLoggingSettings(req: express.Request, res: express.Response, next: express.NextFunction) {
  const logger = container.get<ILoggerListenerService>(TYPES.LoggerListenerService);
  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case LoggingPreferencesEnum.LEVEL: {
        data = await logger.getLogLevel();
        break;
      }

      case LoggingPreferencesEnum.DIRECTORY: {
        data = await logger.getLogDirectory();
        break;
      }

      case LoggingPreferencesEnum.FILENAME: {
        data = await logger.getLogFilename();
        break;
      }

      case LoggingPreferencesEnum.USE_CONSOLE: {
        data = await logger.getLogUseConsole();
        break;
      }

      case LoggingPreferencesEnum.USE_SINGLE_FILE: {
        data = await logger.getLogUseSingleFile();
        break;
      }

      case LoggingPreferencesEnum.USE_ROTATION_FILE: {
        data = await logger.getLogUseDailyRotationFile();
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
