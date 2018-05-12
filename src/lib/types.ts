export const TYPES = {
  ChecksumCalculator: Symbol.for('IChecksumCalculator'),
  ConfigService: Symbol.for('IConfigService'),
  ConfigServiceProvider: Symbol.for('IConfigServiceProvider'),
  Logger: Symbol.for('ILogger'),
  UUIDGenerator: Symbol.for('IUUIDGenerator'),
  PaswordHasher: Symbol.for('IPasswordHasher'),
  DatabaseService: Symbol.for('IDatabaseService'),

  // Database DAO
  LocalUserDAO: Symbol.for('ILocalUserDAO'),
};
