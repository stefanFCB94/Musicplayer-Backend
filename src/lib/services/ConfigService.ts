import * as fs from 'fs-extra';
import { IConfigService } from '../interfaces/IConfigService';
import { injectable } from 'inversify';



@injectable()
export class ConfigService implements IConfigService {

  private config: any;
  private defaultPath = './config/';

  loadConfig(env: string = 'production', file?: string) {
    return new Promise<void>(async (resolve, reject) => {
      let configFile = file;
    
      if (!configFile) {
        configFile = `${this.defaultPath}${env}.json`;
      }
  
      
      try {
        const file = await fs.readFile(configFile);
        const config = JSON.parse(file.toString());
  
        this.config = config;
        return resolve();
      } catch (err) {
        return reject(err);
      }
  
    });
  }

  get(key: string) {
    if (!this.config) {
      throw new Error('Config not loaded');
    }

    if (!key) {
      throw new Error('Key must be given');
    }

    function reducer(obj: any, index: string) {
      if (obj && typeof obj[index] !== 'undefined') { return obj[index]; }
      return undefined;
    }


    return key.split('.').reduce(reducer, this.config);
  }

  set(key: string, data: any) {
    if (!key) {
      throw new Error('Key must be set');
    }

    this.config = this.config || {};
    let ref = this.config;

    const keys = key.split('.');
    keys.forEach((key, index) => {
      if (typeof ref[key] === 'undefined' && typeof keys[index + 1] !== 'undefined') { 
        ref[key] = {};
      }
      
      if (typeof keys[index + 1] === 'undefined') {
        ref[key] = data;
      }

      ref = ref[key];
    });
  }

  isSet(key: string) {
    if (typeof this.get(key) === 'undefined') { return false; }
    return true;
  }
}
