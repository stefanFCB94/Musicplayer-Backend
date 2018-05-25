import { container } from './inversify.config';
import { IUUIDGenerator } from './interfaces/services/IUUIDGenerator';
import { TYPES } from './types';
import { IDatabaseService } from './interfaces/db/IDatabaseService';
import { LocalUser } from './db/models/LocalUser';
import { ILocalUserDAO } from './interfaces/dao/ILocalUserDAO';
import { IAuthentificationService } from './interfaces/services/IAuthentificatonService';
import { IPasswordHasher } from './interfaces/services/IPasswordHasher';


async function start() {
  const authService = container.get<IAuthentificationService>(TYPES.AuthentificationService);
  
  let jwt;
  try {
    const data = await authService.signup({ mail: 'stefan.laeufle@gmail.com', password: 'def', lastname: 'test', firstname: 't' });
    console.log(data);

    jwt = data.jwt;
  } catch (err) {}


  try {
    const temp = await authService.isLoggedIn(jwt);
    console.log(temp);
  } catch (err) {}

  process.exit(0);
}

start();
