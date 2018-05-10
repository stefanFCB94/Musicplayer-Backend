import 'reflect-metadata';
import * as uuid from 'uuid';
import { IUUIDGenerator } from '../interfaces/IUUIDGenerator';
import { ILogger } from '../interfaces/ILogger';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';


@injectable()
export class UUIDGenerator implements IUUIDGenerator {

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
  ) {}

  
  public generateV4() {
    const id = uuid.v4();
    this.logger.log(`UUID generated: ${id}`, 'debug');
    
    return id;
  }
}

