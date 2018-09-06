import * as sharp from 'sharp';

export interface IImageProcessingService {
  getFormat(): Promise<sharp.AvailableFormatInfo>;
  setFormat(format: string): Promise<void>;

  convert(image: Buffer, width: number, height: number): Promise<Buffer>;
}
