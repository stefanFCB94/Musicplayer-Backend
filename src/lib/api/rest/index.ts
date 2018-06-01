import * as express from 'express';

import { loginRoute } from './routes/login';
import { notFoundRoute } from './routes/notFound';
import { signup } from './routes/signup';

export function createApi() {
  const router = express.Router();

  router.post('/login', loginRoute);
  router.post('/signup', signup);


  // If no route matched before, this should be called
  router.all('*', notFoundRoute);

  return router;
}
