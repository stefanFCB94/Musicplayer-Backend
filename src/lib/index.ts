import { container } from './inversify.config';
import { IUUIDGenerator } from './interfaces/IUUIDGenerator';
import { TYPES } from './types';
import { IDatabaseService } from './interfaces/IDatabaseService';
import { LocalUser } from './db/models/LocalUser';
import { ILocalUserDAO } from './interfaces/ILocalUserDAO';
import { UserAlreadyExistsError } from './error/UserAlreadyExistsError';

const uuidGenerator = container.get<IUUIDGenerator>(TYPES.UUIDGenerator);
const id = uuidGenerator.generateV4();

const localUser = new LocalUser();
localUser.id = id;
localUser.mail = 'stefan.laeufle@gmail.com';
localUser.lastname = 'Läufle';
localUser.firstname = 'Stefan';
localUser.password = 'abc';

const dao = container.get<ILocalUserDAO>(TYPES.LocalUserDAO);
dao.createUser(localUser)
  .then(u => console.log(u))
  .catch((err) => {
    process.exit(0);
  });
