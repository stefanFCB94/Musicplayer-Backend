import { SystemPreferences } from '../../db/models/SystemPreferences';

export interface ISystemPreferencesService {
  getPreference(preference: string): Promise<SystemPreferences[]>;
  savePreference(preference: string, values: any[]): Promise<SystemPreferences[]>;
  deletePreference(preference: string): Promise<SystemPreferences[]>;
  isSet(preference: string): Promise<boolean>;
  getPreferenceValues(preference: string): Promise<any[]>;
}
