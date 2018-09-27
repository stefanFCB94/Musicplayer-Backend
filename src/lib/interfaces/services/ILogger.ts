export interface ILogger {
  error(msg: string | Error): Promise<void>;
  warn(msg: string | Error): Promise<void>;
  info(msg: string | Error): Promise<void>;
  verbose(msg: string | Error): Promise<void>;
  debug(msg: string | Error): Promise<void>;
  silly(msg: string | Error): Promise<void>;
}
