import { FileInformation } from './FileInformation';

export interface FileChecksumInformation extends FileInformation {
  checksum: string;
}
