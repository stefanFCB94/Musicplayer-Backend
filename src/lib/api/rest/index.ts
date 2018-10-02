import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';
import { signup } from './routes/signup';

import { getImageFormat } from './routes/preferences/getImageFormat';
import { getHttpPort } from './routes/preferences/getHttpPort';


import { putImageFormat } from './routes/preferences/putImageFormat';




export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);
  router.post('/signup', signup);


  router.get('/preferences/imageformat', getImageFormat);
  router.get('/perferences/httpport', getHttpPort);

  
  router.put('/preferences/imageformat', putImageFormat);
  
  
  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
