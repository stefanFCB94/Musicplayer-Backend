import { Container } from 'inversify';

import { TYPES } from './types';

import { IChecksumCalculator } from './interfaces/services/IChecksumCalculator';
import { ChecksumCalculator } from './services/ChecksumCalculator';

import { IConfigService, IConfigServiceProvider } from './interfaces/services/IConfigService';
import { ConfigService } from './services/ConfigService';

import { ILogger } from './interfaces/services/ILogger';
import { Logger } from './services/Logger';

import { IUUIDGenerator } from './interfaces/services/IUUIDGenerator';
import { UUIDGenerator } from './services/UUIDGenerator';

import { IDatabaseService } from './interfaces/db/IDatabaseService';
import { DatabaseService } from './db/DatabaseService';

import { ILocalUserDAO } from './interfaces/dao/ILocalUserDAO';
import { LocalUserDAO } from './db/dao/LocalUserDAO';

import { IPasswordHasher } from './interfaces/services/IPasswordHasher';
import { PasswordHasher } from './services/PaswordHasher';

import { IJWTGenerator } from './interfaces/services/IJWTGenerator';
import { JWTGenerator } from './services/JWTGenerator';

import { IAuthentificationService } from './interfaces/services/IAuthentificatonService';
import { AuthentificationService } from './services/AuthentificationService';


const container = new Container();


container.bind<IChecksumCalculator>(TYPES.ChecksumCalculator)
  .to(ChecksumCalculator).inSingletonScope();

container.bind<IConfigService>(TYPES.ConfigService)
  .to(ConfigService).inSingletonScope();

container.bind<ILogger>(TYPES.Logger)
  .to(Logger).inSingletonScope();

container.bind<IUUIDGenerator>(TYPES.UUIDGenerator)
  .to(UUIDGenerator).inSingletonScope();

container.bind<IPasswordHasher>(TYPES.PaswordHasher)
  .to(PasswordHasher).inSingletonScope();

container.bind<IDatabaseService>(TYPES.DatabaseService)
  .to(DatabaseService).inSingletonScope();

container.bind<IJWTGenerator>(TYPES.JWTGenerator)
  .to(JWTGenerator).inSingletonScope();

container.bind<IAuthentificationService>(TYPES.AuthentificationService)
  .to(AuthentificationService).inSingletonScope();


// Database DAOs
container.bind<ILocalUserDAO>(TYPES.LocalUserDAO)
  .to(LocalUserDAO).inSingletonScope();


// Providers
container.bind<IConfigServiceProvider>(TYPES.ConfigServiceProvider)
  .toProvider<IConfigService>((context) => {
    let singleton: IConfigService;

    return () => {
      if (singleton) { return Promise.resolve(singleton); }

      return new Promise<IConfigService>(async (resolve, reject) => {
        const service = context.container.get<IConfigService>(TYPES.ConfigService);
        await service.loadConfig('production');

        singleton = service;
        resolve(service);
      });
    };
  });



export { container };
