import { LocalUser } from '../../db/models/LocalUser';

export interface IJWTGenerator {
  generateJWT(user: LocalUser): Promise<string>;
  verifyJWT(jwt: string): Promise<JWTPayload>;
}

export interface JWTPayload {
  userId: string;
  mail: string;
}
