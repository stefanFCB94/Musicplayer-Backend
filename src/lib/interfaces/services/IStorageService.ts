export interface IStorageService {
  saveFile(path: string, filename: string, file: Buffer): Promise<string>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
