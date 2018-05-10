import { container } from './inversify.config';
import { IUUIDGenerator } from './interfaces/IUUIDGenerator';
import { TYPES } from './types';

const uuidGenerator = container.get<IUUIDGenerator>(TYPES.UUIDGenerator);
uuidGenerator.generateV4();

