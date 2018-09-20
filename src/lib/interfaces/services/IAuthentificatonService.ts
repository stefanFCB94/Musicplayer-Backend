import { LocalUser } from '../../db/models/LocalUser';

export interface IAuthentificationService {
  getSignupAvailable(): Promise<boolean>;
  setSignupAvailable(signupPossible: boolean): Promise<void>;
  login(mail: string, password: string): Promise<string>;
  isLoggedIn(jwt: string): Promise<string>;
  renewJWT(jwt: string): Promise<string>;
  signup(data: SignupValues): Promise<SignupReturn>;
  resetPassword(userId: string, oldPw: string, newPw: string): Promise<void>;
}


export interface SignupValues {
  mail: string;
  password: string;
  lastname: string;
  firstname?: string;
  loginPossible?: boolean;
}

export interface SignupReturn {
  user: LocalUser;
  jwt: string;
}
