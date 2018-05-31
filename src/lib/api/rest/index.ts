import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';

export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);


  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
