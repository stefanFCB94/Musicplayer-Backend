import * as express from 'express';
import { container } from '../../../../inversify.config';
import { ILibraryReaderService } from '../../../../interfaces/services/ILibraryReaderService';
import { TYPES } from '../../../../types';
import { sendData } from '../../utils/sendData';
import { sendError } from '../../utils/sendError';
import { LibraryPreferencesEnum } from '../../../../enums/preferences/LibraryPreferencesEnum';



export async function getLibrarySettings(req: express.Request, res: express.Response, next: express.NextFunction) {

  const libraryReader = container.get<ILibraryReaderService>(TYPES.LibraryReaderService);
  const option = req.params.option;

  try {
    let data: any;

    switch (option) {

      case LibraryPreferencesEnum.PATHS: {
        data = await libraryReader.getLibraryPaths();
        break;
      }

      case LibraryPreferencesEnum.PATHS: {
        data = await libraryReader.getSupportedMimeTypes();
        break;
      }

      default: {
        return next();
      }
    }

    return res.status(200).json(sendData(data));
  }  catch (error) {
    return res.status(error.code || 500).json(sendError(error));
  }

}
