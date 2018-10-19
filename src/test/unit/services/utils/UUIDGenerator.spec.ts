import 'reflect-metadata';
import * as uuid from 'uuid';

import { UUIDGenerator } from '../../../../lib/services/utils/UUIDGenerator';

import { ContainerModule, Container } from 'inversify';
import { TYPES } from '../../../../lib/types';

import { LoggerMock } from '../../../mocks/Logger.mock';


const containerModule = new ContainerModule((bind) => {
  bind(TYPES.Logger).to(LoggerMock);
});


describe('UUIDGeneratorService', () => {

  let uuidSpy: jasmine.Spy;
  let logSpy: jasmine.Spy;

  let container: Container;
  let service: UUIDGenerator;


  beforeEach(() => {
    uuidSpy = spyOn(uuid, 'v4').and.returnValue('1234');

    container = new Container();
    container.load(containerModule);
    container.bind('UUID').to(UUIDGenerator).inSingletonScope();
        
    service = container.get<UUIDGenerator>('UUID');

    logSpy = spyOn((service as any).logger, 'debug');
  });

  afterEach(() => {
    container = null;
  });


  it('should create instance through inversifyjs', () => {
    expect(service).toBeTruthy();
  });

  describe('Function generateV4', () => {
    
    it('should return a generated UUID of version 4 type', () => {
      const ret = service.generateV4();

      expect(uuidSpy).toHaveBeenCalled();
      expect(ret).toEqual('1234');
    });

    it('should log the generated uuid with debug level', () => {
      service.generateV4();

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.calls.first().args[0]).toContain('1234');
    });
  });

});
