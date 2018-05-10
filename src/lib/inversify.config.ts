import { Container } from 'inversify';
import { IChecksumCalculator } from './interfaces/IChecksumCalculator';
import { TYPES } from './types';
import { ChecksumCalculator } from './services/ChecksumCalculator';
import { IConfigService, IConfigServiceProvider } from './interfaces/IConfigService';
import { ConfigService } from './services/ConfigService';
import { ILogger } from './interfaces/ILogger';
import { Logger } from './services/Logger';
import { IUUIDGenerator } from './interfaces/IUUIDGenerator';
import { UUIDGenerator } from './services/UUIDGenerator';


const container = new Container();


container.bind<IChecksumCalculator>(TYPES.ChecksumCalculator)
  .to(ChecksumCalculator);

container.bind<IConfigService>(TYPES.ConfigService)
  .to(ConfigService);

container.bind<ILogger>(TYPES.Logger)
  .to(Logger);

container.bind<IUUIDGenerator>(TYPES.UUIDGenerator)
  .to(UUIDGenerator);



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
