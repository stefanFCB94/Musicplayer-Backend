export interface IStorageService {
  getBaseStorage(): Promise<string>;
  setBaseStorage(path: string, opts?: { moveContent?: boolean }): Promise<void>;
  
  saveFile(path: string, filename: string, file: Buffer): Promise<string>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
