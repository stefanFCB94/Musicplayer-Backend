import { SystemPreferences } from '../../db/models/SystemPreferences';


export interface ISystemPreferencesDAO {
  saveOrUpdatePreferences(preferences: SystemPreferences[]): Promise<SystemPreferences[]>;
  deletePreference(preference: string): Promise<SystemPreferences[]>;
  getPreferences(preference: string): Promise<SystemPreferences[]>;
}
