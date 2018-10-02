import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';
import { signup } from './routes/signup';

import { getImageFormat } from './routes/preferences/getImageFormat';
import { getHttpPort } from './routes/preferences/getHttpPort';
import { getHttpsPort } from './routes/preferences/getHttpsPort';
import { getUseHttps } from './routes/preferences/getUseHttps';


import { putImageFormat } from './routes/preferences/putImageFormat';




export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);
  router.post('/signup', signup);


  router.get('/preferences/IMAGE.FORMAT', getImageFormat);
  router.get('/preferences/SERVER.HTTP_PORT', getHttpPort);
  router.get('/preferences/SERVER.HTTPS_PORT', getHttpsPort);
  router.get('/preferences/SERVER.HTTPS', getUseHttps);

  
  router.put('/preferences/IMAGE.FORMAT', putImageFormat);
  
  
  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
