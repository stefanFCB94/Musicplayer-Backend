export interface IImageProcessingService {
  convert(image: Buffer, width: number, height: number): Promise<Buffer>;
}
