import * as fs from 'fs-extra';
import * as path from 'path';
import * as mime from 'mime';

import { BaseService } from '../../base/BaseService';
import { IDirectoryReaderService } from '../../interfaces/services/IDirectoryReaderService';

import { FileInformation } from '../../interfaces/models/FileInformation';



/**
 * @class
 * 
 * A service which has the functionality to read recursivly all files
 * in a specific directory.
 * 
 * @extends BaseService
 */
export class DirectoryReaderService extends BaseService implements IDirectoryReaderService {
 

  /**
   * @public
   * @async
   * 
   * Read all files of the path, which is passed as first argument, recursivly
   * and return basic information about each found file.
   * 
   * Returns the size, mime type and the absolute path of the found files
   * in an array.
   * 
   * @param {string} path2Read The path, which should be read
   * 
   * @returns {Promise<FileInformation[]>} The found files
   * 
   * @throws {Error}
   */
  public async readDirectory(path2Read: string): Promise<FileInformation[]> {
    this.logger.debug(`Read all information of the path '${path2Read}'`);

    let files: FileInformation[] = [];
    
    const stats = await fs.stat(path2Read);
    if (stats.isDirectory()) {

      this.logger.debug(`'${path2Read}' is a directory, so read content of the directory`);
      const content = await fs.readdir(path2Read);

      for (let i = 0; i < content.length; i++) {
        const subdirContent = await this.readDirectory(path.join(path2Read, content[i]));
        files = files.concat(subdirContent);
      }

      this.logger.debug(`'${path2Read}' successfully recursivly read`);
      return files;
    }
    
    if (stats.isFile()) {
      this.logger.debug(`${path2Read}' is a file, so get information and add it to found files`);

      const infos: FileInformation = {
        path: path2Read,
        size: stats.size,
        mime: mime.getType(path2Read),
      };

      files.push(infos);
      return files;
    }

    return files;
  }

}
