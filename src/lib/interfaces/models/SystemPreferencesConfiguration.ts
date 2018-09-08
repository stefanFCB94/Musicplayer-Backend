import { SystemPreferences } from '../../db/models/SystemPreferences';


export interface SystemPreferencesConfigurations {
  [key: string]: SystemPreferencesConfiguration;
}

export interface SystemPreferencesConfiguration {
  cachedValue?: any[];
  default?: any;
  allowedValues?: any[];
  checkValueFn?: (value: any) => Promise<boolean>;
}
