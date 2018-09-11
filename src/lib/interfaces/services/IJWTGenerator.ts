import { LocalUser } from '../../db/models/LocalUser';

export interface IJWTGenerator {
  generateJWT(user: LocalUser): Promise<string>;
  verifyJWT(jwt: string): Promise<JWTPayload>;

  setAlgorithm(alogrithm: string): Promise<void>;
  setExpiresIn(expiresIn: string): Promise<void>;
  setSecretKey(secretKey: string): Promise<void>;

  getAlgorithm(): Promise<string>;
  getExpiresIn(): Promise<string>;
  getSecretKey(): Promise<string>;
}

export interface JWTPayload {
  userId: string;
  mail: string;
}
