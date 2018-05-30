import { container } from '../../../inversify.config';
import { TYPES } from '../../../types';
import { ILocalUserService } from '../../../interfaces/services/ILocalUserService';
import { UserNotExistsError } from '../../../error/auth/UserNotExistsError';

export async function getUser(obj: any, args: { id: string }) {
  const localUserService = container.get<ILocalUserService>(TYPES.LocalUserService);

  const user = await localUserService.getUser(args.id);

  if (!user) {
    const error = new UserNotExistsError(null, args.id, 'User could not be found');
    throw error;
  }
  return user;
}
