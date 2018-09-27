import { LogLevel } from '../../enums/LogLevel';

export interface LogDataEvent {
  msg: string;
  level: LogLevel;
}
