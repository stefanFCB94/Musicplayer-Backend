import { container } from '../../../inversify.config';
import { ILocalUserService } from '../../../interfaces/services/ILocalUserService';
import { TYPES } from '../../../types';
import { UserNotExistsError } from '../../../error/auth/UserNotExistsError';


export async function getUserByMail(obj: any, args: { mail: string}) {
  const localUserService = container.get<ILocalUserService>(TYPES.LocalUserService);

  const user = await localUserService.getUserByMail(args.mail);

  if (!user) {
    const error = new UserNotExistsError(args.mail, null, 'User could not be found');
    throw error;
  }

  return user;
}
