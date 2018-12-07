import * as fs from 'fs-extra';
import { FileInformation } from '../models/FileInformation';

export interface ILibraryReaderService {
  getLibraryPaths(): Promise<string[]>;
  setLibraryPaths(paths: string[]): Promise<void>;
  addLibraryPath(path: string): Promise<void>;
  removeLibraryPath(path: string): Promise<void>;

  getAllFilesInLibraryPaths(): Promise<FileInformation[]>;
}
