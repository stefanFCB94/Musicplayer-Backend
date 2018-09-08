import { SystemPreferences } from '../../db/models/SystemPreferences';

export interface ISystemPreferencesService {
  savePreference(preference: string, values: any[]): Promise<SystemPreferences[]>;
  deletePreference(preference: string): Promise<SystemPreferences[]>;
  isSet(preference: string): Promise<boolean>;
  getPreferenceValues(preference: string): Promise<any[]>;

  setAllowedValues(preference: string, values: any[]): void;
  setCheckFunction(preference: string, fn: (value: any) => Promise<boolean>): void;
  setDefaultValue(preference: string, value: any[]): void;
}
