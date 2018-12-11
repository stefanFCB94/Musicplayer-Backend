import * as fs from 'fs-extra';
import { FileInformation } from '../models/FileInformation';
import { FileChecksumInformation } from '../models/FileChecksumInformation';

export interface ILibraryReaderService {
  getLibraryPaths(): Promise<string[]>;
  setLibraryPaths(paths: string[]): Promise<void>;
  addLibraryPath(path: string): Promise<void>;
  removeLibraryPath(path: string): Promise<void>;

  getSupportedMimeTypes(): Promise<string[]>;
  setSupportedMimeTypes(types: string[]): Promise<void>;
  addSupportedMimeType(type: string): Promise<void>;
  removeSupportedMimeType(type: string): Promise<void>;

  getAllFilesInLibraryPaths(): Promise<FileInformation[]>;
  getHashToFiles(files: FileInformation[]): Promise<FileChecksumInformation[]>;
}
