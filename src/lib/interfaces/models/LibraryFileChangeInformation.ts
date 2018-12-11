import { FileChecksumInformation } from './FileChecksumInformation';
import { LibraryFile } from '../../db/models/LibraryFile';
import { LibraryFileChangeOperation } from '../../enums/LibraryFileChangeOperation';


export interface LibraryFileChangeInformation {
  operation: LibraryFileChangeOperation;
  file?: FileChecksumInformation;
  library_file?: LibraryFile;
}
