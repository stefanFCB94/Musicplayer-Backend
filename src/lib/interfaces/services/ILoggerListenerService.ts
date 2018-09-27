export interface ILoggerListenerService {
  getLogLevel(): Promise<string>;
  getLogDirectory(): Promise<string>;
  getLogFilename(): Promise<string>;
  getLogUseSingleFile(): Promise<boolean>;
  getLogUseDailyRotationFile(): Promise<boolean>;
  getLogUseConsole(): Promise<boolean>;

  setLogLevel(logLevel: string): Promise<void>;
  setLogDirectory(directory: string): Promise<void>;
  setLogFilename(filename: string): Promise<void>;
  setLogUseSingleFile(useSingleFile: boolean): Promise<void>;
  setLogUseDailyRotationFile(useDailyRotationFile: boolean): Promise<void>;
  setLogUseConsole(useConsole: boolean): Promise<void>;

  init(): Promise<void>;
}
