import { LibraryFile } from '../../db/models/LibraryFile';

export interface ILibraryFileDAO {
  saveOrUpdateFile(file: LibraryFile): Promise<LibraryFile>;
  getFileByChecksum(checksum: string): Promise<LibraryFile>;
  deleteFile(file: LibraryFile): Promise<LibraryFile>;
  getAllFiles(): Promise<LibraryFile[]>;
}
