import { LocalUser } from '../../db/models/LocalUser';

export interface ILocalUserService {
  getUser(id: string): Promise<LocalUser>;
  getUserByMail(mail: string): Promise<LocalUser>;

  getUsers(skip?: number, limit?: number): Promise<LocalUser[]>;
}
