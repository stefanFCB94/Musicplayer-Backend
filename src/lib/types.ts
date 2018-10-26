export const TYPES = {
  LoggerEventEmitter: Symbol.for('EventEmitter'),

  Server: Symbol.for('IServer'),

  ChecksumCalculator: Symbol.for('IChecksumCalculator'),
  ConfigService: Symbol.for('IConfigService'),
  ConfigServiceProvider: Symbol.for('IConfigServiceProvider'),
  Logger: Symbol.for('ILogger'),
  LoggerListenerService: Symbol.for('ILoggerListenerService'),
  UUIDGenerator: Symbol.for('IUUIDGenerator'),
  PasswordHasher: Symbol.for('IPasswordHasher'),
  JWTGenerator: Symbol.for('IJWTGenerator'),
  AuthentificationService: Symbol.for('IAuthentificationService'),
  DatabaseService: Symbol.for('IDatabaseService'),
  LocalUserService: Symbol.for('ILocalUserService'),
  StorageService: Symbol.for('IStorageService'),
  ImageProcessingService: Symbol.for('IImageProcessingService'),
  SystemPreferencesService: Symbol.for('ISystemPreferencesService'),
  LibraryReaderService: Symbol.for('ILibraryReaderService'),
  DirectoryReaderService: Symbol.for('IDirectoryReaderService'),

  // Database DAO
  LocalUserDAO: Symbol.for('ILocalUserDAO'),
  StorageFileDAO: Symbol.for('IStorageFileDAO'),
  SystemPreferencesDAO: Symbol.for('ISystemPreferencesDAO'),
  LibraryFileDAO: Symbol.for('ILibraryFileDAO'),
};
