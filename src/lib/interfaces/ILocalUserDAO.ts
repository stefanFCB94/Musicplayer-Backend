import { LocalUser } from '../db/models/LocalUser';

export interface ILocalUserDAO {
  saveOrUpdateUser(user: LocalUser): Promise<LocalUser>;
  getUsers(orderCol?: string, orderDirection?: string, skip?: number, maxItems?: number): Promise<LocalUser[]>;
  getUserById(id: string): Promise<LocalUser>;
  getUserByMail(mail: string): Promise<LocalUser>;
  deleteUser(user: LocalUser): Promise<LocalUser>;
}
