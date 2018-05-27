import { container } from '../../../inversify.config';
import { ILocalUserDAO } from '../../../interfaces/dao/ILocalUserDAO';
import { TYPES } from '../../../types';

export async function getUser(obj: any, args: { id: string }) {
  const localUserDAO = container.get<ILocalUserDAO>(TYPES.LocalUserDAO);
  return await localUserDAO.getUserById(args.id);
}
