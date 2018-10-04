import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';
import { signup } from './routes/signup';

import { getImageSettings } from './routes/preferences/getImageSettings';
import { getServerSettings } from './routes/preferences/getServerSettings';


import { putImageFormat } from './routes/preferences/putImageFormat';




export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);
  router.post('/signup', signup);


  router.get('/preferences/:option', getServerSettings);
  router.get('/preferences/:option', getImageSettings);
  

  router.put('/preferences/IMAGE.FORMAT', putImageFormat);
  
  
  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
