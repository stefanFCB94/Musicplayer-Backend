import { injectable, inject } from 'inversify';
import { ILocalUserService } from '../interfaces/services/ILocalUserService';
import { TYPES } from '../types';
import { ILocalUserDAO } from '../interfaces/dao/ILocalUserDAO';
import { LocalUser } from '../db/models/LocalUser';


@injectable()
export class LocalUserService implements ILocalUserService {

  constructor(
    @inject(TYPES.LocalUserDAO) private localUserDAO: ILocalUserDAO,
  ) {}

  getUser(id: string): Promise<LocalUser> {
    return this.localUserDAO.getUserById(id);
  }
    
  getUserByMail(mail: string): Promise<LocalUser> {
    return this.localUserDAO.getUserByMail(mail);
  }

  getUsers(skip?: number, limit?: number): Promise<LocalUser[]> {
    return this.localUserDAO.getUsers(null, null, skip, limit);  
  }
}
