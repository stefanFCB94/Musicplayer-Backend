import { LocalUser } from '../../db/models/LocalUser';

export interface IAuthentificationService {
  isSignupAvailable(): Promise<boolean>;
  login(mail: string, password: string): Promise<string>;
  isLoggedIn(jwt: string): Promise<string>;
  renewJWT(jwt: string): Promise<string>;
  signup(data: SignupValues): Promise<SignupReturn>;
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
