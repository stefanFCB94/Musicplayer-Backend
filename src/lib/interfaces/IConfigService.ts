export interface IConfigService {
  loadConfig(env?: string, file?: string): Promise<void>;
  get(key: string): any;
  set(key: string, data: any): void;
  isSet(key: string): boolean;
}

export type IConfigServiceProvider = () => Promise<IConfigService>;
