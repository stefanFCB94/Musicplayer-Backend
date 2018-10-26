import { FileInformation } from '../models/FileInformation';

export interface IDirectoryReaderService {
  readDirectory(path2Read: string): Promise<FileInformation[]>;
}
