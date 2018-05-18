export interface IPasswordHasher {
  hash(pw: string): Promise<string>;
  compare(pw: string, hash: string): Promise<boolean>;
}
