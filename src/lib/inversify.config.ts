import { EventEmitter } from 'events';

import { Container } from 'inversify';

import { TYPES } from './types';

import { IChecksumCalculator } from './interfaces/services/IChecksumCalculator';
import { ChecksumCalculator } from './services/utils/ChecksumCalculator';

import { IConfigService, IConfigServiceProvider } from './interfaces/services/IConfigService';
import { ConfigService } from './services/config/ConfigService';

import { ILogger } from './interfaces/services/ILogger';
import { Logger } from './services/logging/Logger';

import { IUUIDGenerator } from './interfaces/services/IUUIDGenerator';
import { UUIDGenerator } from './services/utils/UUIDGenerator';

import { IDatabaseService } from './interfaces/db/IDatabaseService';
import { DatabaseService } from './db/DatabaseService';

import { ILocalUserDAO } from './interfaces/dao/ILocalUserDAO';
import { LocalUserDAO } from './db/dao/LocalUserDAO';

import { IPasswordHasher } from './interfaces/services/IPasswordHasher';
import { PasswordHasher } from './services/auth/PasswordHasher';

import { IJWTGenerator } from './interfaces/services/IJWTGenerator';
import { JWTGenerator } from './services/auth/JWTGenerator';

import { IAuthentificationService } from './interfaces/services/IAuthentificatonService';
import { AuthentificationService } from './services/auth/AuthentificationService';

import { ILocalUserService } from './interfaces/services/ILocalUserService';
import { LocalUserService } from './services/auth/LocalUserService';

import { IServer } from './interfaces/IServer';
import { Server } from './server';

import { IStorageService } from './interfaces/services/IStorageService';
import { StorageService } from './services/filesystem/StorageService';

import { IStorageFileDAO } from './interfaces/dao/IStorageFileDAO';
import { StorageFileDAO } from './db/dao/StorageFileDAO';

import { IImageProcessingService } from './interfaces/services/IImageProcessingService';
import { ImageProcessingService } from './services/utils/ImageProcessingService';

import { ISystemPreferencesDAO } from './interfaces/dao/ISystemPreferencesDAO';
import { SystemPreferencesDAO } from './db/dao/SystemPreferencesDAO';

import { ISystemPreferencesService } from './interfaces/services/ISystemPreferencesService';
import { SystemPreferencesService } from './services/config/SystemPreferencesService';

import { ILoggerListenerService } from './interfaces/services/ILoggerListenerService';
import { LoggerListenerService } from './services/logging/LoggerListenerService';




const container = new Container();


container.bind<EventEmitter>(TYPES.LoggerEventEmitter)
  .toConstantValue(new EventEmitter());


container.bind<IServer>(TYPES.Server)
  .to(Server).inSingletonScope();

container.bind<IChecksumCalculator>(TYPES.ChecksumCalculator)
  .to(ChecksumCalculator).inSingletonScope();

container.bind<IConfigService>(TYPES.ConfigService)
  .to(ConfigService).inSingletonScope();

container.bind<ILogger>(TYPES.Logger)
  .to(Logger).inSingletonScope();

container.bind<ILoggerListenerService>(TYPES.LoggerListenerService)
  .to(LoggerListenerService).inSingletonScope();

container.bind<IUUIDGenerator>(TYPES.UUIDGenerator)
  .to(UUIDGenerator).inSingletonScope();

container.bind<IPasswordHasher>(TYPES.PasswordHasher)
  .to(PasswordHasher).inSingletonScope();

container.bind<IDatabaseService>(TYPES.DatabaseService)
  .to(DatabaseService).inSingletonScope();

container.bind<IJWTGenerator>(TYPES.JWTGenerator)
  .to(JWTGenerator).inSingletonScope();

container.bind<IAuthentificationService>(TYPES.AuthentificationService)
  .to(AuthentificationService).inSingletonScope();

container.bind<ILocalUserService>(TYPES.LocalUserService)
  .to(LocalUserService).inSingletonScope();

container.bind<IImageProcessingService>(TYPES.ImageProcessingService)
  .to(ImageProcessingService).inSingletonScope();

container.bind<ISystemPreferencesService>(TYPES.SystemPreferencesService)
  .to(SystemPreferencesService).inSingletonScope();


// Database DAOs
container.bind<ILocalUserDAO>(TYPES.LocalUserDAO)
  .to(LocalUserDAO).inSingletonScope();

container.bind<IStorageFileDAO>(TYPES.StorageFileDAO)
  .to(StorageFileDAO).inSingletonScope();

container.bind<ISystemPreferencesDAO>(TYPES.SystemPreferencesDAO)
  .to(SystemPreferencesDAO).inSingletonScope();


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

container.bind<IStorageService>(TYPES.StorageService)
  .to(StorageService).inSingletonScope();

export { container };
