export interface IChecksumCalculator {
  getMD5Checksum(file: Buffer|string): Promise<string>;
}
