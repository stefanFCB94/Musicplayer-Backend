export interface ILogger {
  log(msg: string, level: string): Promise<void>;
}
