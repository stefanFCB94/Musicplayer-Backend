import * as sharp from 'sharp';

import { inject } from 'inversify';
import { TYPES } from '../types';

import { BaseConfigService } from '../base/BaseConfigService';
import { ILogger } from '../interfaces/services/ILogger';
import { IImageProcessingService } from '../interfaces/services/IImageProcessingService';
import { IConfigServiceProvider } from '../interfaces/services/IConfigService';

import { ImageProcessingError } from '../error/media/ImageProcessingError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Serivce class, which can be used to handle image transformations.
 * 
 * The service offers basic functions to format a image to different
 * formats and sizes. Service can be used to convert cover or artist
 * images.
 */
export class ImageProcessingService extends BaseConfigService implements IImageProcessingService {

  private serviceInitialized = false;

  private formatKey = 'IMAGES.FORMAT';
  private format: sharp.AvailableFormatInfo;

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.ConfigServiceProvider) configProvider: IConfigServiceProvider,
  ) {
    super(logger, configProvider);
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initialize the ImageProcessingService by getting the format
   * of the pictures from the config service.
   * 
   * Default JPEG is used. The default value will be used, when
   * no value is configured in the config file or a unsupported
   * value is configured.
   * 
   * @throws {ServiceNotInitalized} If the conifg file could not be read
   */
  public async init() {
    if (this.serviceInitialized) { return; }

    this.logger.log('Start initializing ImageProcessingService', 'debug');

    await this.initConfigService();

    let configFormat = <string> this.configService.get(this.formatKey);
    this.logger.log(`Image size in config file: ${configFormat}`, 'debug');

    if (!configFormat) {
      this.logger.log('No specific format used, so use JPEG as default', 'debug');

      this.format = sharp.format.jpeg;
      this.serviceInitialized = true;
      return;
    }

    // To ensure no upper/lowercase error is in config file
    configFormat = configFormat.toUpperCase();
    
    if (configFormat === 'JPG' || configFormat === 'JPEG') {
      this.logger.log('JPEG is selected as image format', 'debug');
      this.format = sharp.format.jpeg;
    }

    if (configFormat === 'PNG') {
      this.logger.log('PNG is used as image format', 'debug');
      this.format = sharp.format.png;
    }

    if (!configFormat) {
      this.logger.log(`${configFormat} is not supported as image format. JPEG used as default`, 'warn');
      this.format = sharp.format.jpeg;
    }

    this.serviceInitialized = true;
  }

  
  /**
   * @public
   * @author Stefan Läufle
   * 
   * Converts the image, which is passed as first parameter
   * into a image of specific height and width. As format of
   * the converted image, the format configured in the config file
   * will be used.
   * 
   * Function returns a new buffer, which can be handled like
   * wanted.
   * 
   * @param {Buffer} image The image, which should be converted
   * @param {number} width The width in pixel the converted image should have
   * @param {number} height The height in pixel the converted image should have
   * 
   * @returns {Promise<Buffer>} The converted image as buffer
   * 
   * @throws {Error} If a unsupported error on resizing of converting of the image happens
   */
  public async convert(image: Buffer, width: number, height: number): Promise<Buffer> {
    await this.init();

    this.logger.log(`Try to convert image to a size of ${width}x${height}`, 'debug');

    try {
      const ret = await sharp(image)
        .resize(width, height)
        .ignoreAspectRatio()
        .background('white')
        .flatten()
        .toFormat(this.format)
        .toBuffer();
      
      this.logger.log('Resizing of image completed', 'debug');

      return ret;
    } catch (err) {
      this.logger.log('Error transforming image', 'error');
      this.logger.log(err.stack, 'error');

      const error = new ImageProcessingError('Error by processing image');
      this.logger.log(error.stack, 'warn');
    
      throw error;
    }
  }

}
