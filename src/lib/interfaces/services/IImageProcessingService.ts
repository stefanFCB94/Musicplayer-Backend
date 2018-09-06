export interface IImageProcessingService {
  getFormat(): Promise<string>;
  setFormat(format: string): Promise<void>;

  convert(image: Buffer, width: number, height: number): Promise<Buffer>;
}
