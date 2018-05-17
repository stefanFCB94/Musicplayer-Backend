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
localUser.id = '60ed87a8-46fa-41a4-9a16-54fbee642813';
localUser.mail = 'stefan.laeufle@gmail.com';
localUser.lastname = 'Läufle';
localUser.firstname = 'Stefan';
localUser.password = 'abc';

const dao = container.get<ILocalUserDAO>(TYPES.LocalUserDAO);
dao.saveOrUpdateUser(localUser)
  .then((u) => {
    console.log(u);
    process.exit(0);
  })
  .catch((err) => {
    process.exit(255);
  });
