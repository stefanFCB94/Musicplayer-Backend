export const TYPES = {
  ChecksumCalculator: Symbol.for('IChecksumCalculator'),
  ConfigService: Symbol.for('IConfigService'),
  ConfigServiceProvider: Symbol.for('IConfigServiceProvider'),
  Logger: Symbol.for('ILogger'),
  UUIDGenerator: Symbol.for('IUUIDGenerator'),
  PasswordHasher: Symbol.for('IPasswordHasher'),
  JWTGenerator: Symbol.for('IJWTGenerator'),
  AuthentificationService: Symbol.for('IAuthentificationService'),
  DatabaseService: Symbol.for('IDatabaseService'),
  LocalUserService: Symbol.for('ILocalUserService'),

  // Database DAO
  LocalUserDAO: Symbol.for('ILocalUserDAO'),
};
