import { LocalUser } from '../db/models/LocalUser';

export interface ILocalUserDAO {
  createUser(user: LocalUser): Promise<LocalUser>;  
}
