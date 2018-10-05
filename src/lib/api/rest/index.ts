import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';
import { signup } from './routes/signup';

import { getImageSettings } from './routes/preferences/getImageSettings';
import { getServerSettings } from './routes/preferences/getServerSettings';
import { getAuthSettings } from './routes/preferences/getAuthSettings';
import { getSecuritySettings } from './routes/preferences/getSecuritySettings';
import { getStorageSettings } from './routes/preferences/getStorageSettings';
import { getLoggingSettings } from './routes/preferences/getLoggingSettings';

import { putImageFormat } from './routes/preferences/putImageFormat';





export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);
  router.post('/signup', signup);


  router.get('/preferences/:option', getServerSettings);
  router.get('/preferences/:option', getImageSettings);
  router.get('/preferences/:option', getAuthSettings);
  router.get('/preferences/:option', getSecuritySettings);
  router.get('/preferences/:option', getStorageSettings);
  router.get('/preferences/:option', getLoggingSettings);

  router.put('/preferences/IMAGE.FORMAT', putImageFormat);
  
  
  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
