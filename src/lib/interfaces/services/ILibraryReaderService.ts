import * as fs from 'fs-extra';

export interface ILibraryReaderService {
  getLibraryPaths(): Promise<string[]>;
  setLibraryPaths(paths: string[]): Promise<void>;
  addLibraryPath(path: string): Promise<void>;
  removeLibraryPath(path: string): Promise<void>;
}
