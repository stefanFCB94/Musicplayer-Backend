import { StorageFile } from '../../db/models/StorageFile';
import { OrderDirectionEnum } from '../../enums/OrderDirection';

export interface IStorageFileDAO {
  saveOrUpdateFile(file: StorageFile): Promise<StorageFile>;
  getFiles(orderCol?: string, orderDir?: OrderDirectionEnum, skip?: number, maxItems?: number): Promise<StorageFile[]>;
  getFile(id: string): Promise<StorageFile>;
  getFileByChecksum(checksum: string): Promise<StorageFile>;
  deleteFile(file: StorageFile): Promise<StorageFile>;
}
