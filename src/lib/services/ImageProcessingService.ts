import * as sharp from 'sharp';

import { inject } from 'inversify';
import { TYPES } from '../types';

import { ILogger } from '../interfaces/services/ILogger';
import { IImageProcessingService } from '../interfaces/services/IImageProcessingService';

import { ImageProcessingError } from '../error/media/ImageProcessingError';
import { BaseService } from '../base/BaseService';
import { ISystemPreferencesService } from '../interfaces/services/ISystemPreferencesService';


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
export class ImageProcessingService extends BaseService implements IImageProcessingService {

  private systemPreferences: ISystemPreferencesService;

  private formatKey = 'IMAGES.FORMAT';
  private format: sharp.AvailableFormatInfo;
  private formatDefault = sharp.format.jpeg;

  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.SystemPreferencesService) prefrences: ISystemPreferencesService,
  ) {
    super(logger);

    this.systemPreferences = prefrences;
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Select to a system preference format value the responding
   * sharp image format.
   * 
   * Used to match a string to a enum value, which can be used
   * for the image processing by sharp
   * 
   * @param {string} format The string representation of the image format
   * @returns {sharp.AvailableFormatInfo} The responding sharp image format
   */
  private getSharpImageFormat(format: string): sharp.AvailableFormatInfo {
    if (format.toUpperCase() === 'JPG' || format.toUpperCase() === 'JPEG') {
      this.logger.log('JPEG as image format', 'debug');
      return sharp.format.jpeg;
    }

    if (format.toUpperCase() === 'PNG') {
      this.logger.log('PNG as image format', 'debug');
      return sharp.format.png;
    }

    this.logger.log(`${format} is not supported as image format. JPEG is used as default format`, 'warn');
    return sharp.format.jpeg;
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the image format, which should be used for the processing
   * of images.
   * 
   * Function get the image format from the system prefrences service
   * and if not set uses the configured default format.
   * 
   * @returns {Promise<sharp.AvailableFormatInfo>} The image format
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getFormat(): Promise<sharp.AvailableFormatInfo> {
    this.logger.log('Get format of the picture', 'debug');

    if (this.format) {
      this.logger.log('Format already requested from the database', 'debug');
      return this.format;
    }

    this.logger.log('Get format from the database', 'debug');

    const configFormat = await this.systemPreferences.getPreferenceValues(this.formatKey);
    
    if (configFormat.length > 0) {
      this.logger.log('Default format is configured in the database', 'debug');

      const format = configFormat[0];
      this.format = this.getSharpImageFormat(format);
    } else {
      this.logger.log('No format for images selected, so used default format', 'debug');
      this.format = this.formatDefault;
    }

    return this.format;
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set the format for the image format, which should be used by
   * this servcie for processing images. Saves the configuration to
   * the database through the system preferences service.
   * 
   * Also sets the image format in this instance.
   * 
   * @param {string} format The image foramt, which should be set
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {Error} 
   */
  public async setFormat(format: string): Promise<void> {
    this.logger.log(`Set the format of the image format to ${format}`, 'debug');

    await this.systemPreferences.savePreference(this.formatKey, [format]);
    this.logger.log('Image format set to database', 'debug');

    this.format = this.getSharpImageFormat(format);
    this.logger.log('Image format set in the instance', 'debug');
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
   * @throws {ServiceNotInitializedError} If the system preference service in not fully initialized
   * @throws {ImageProcessingError} If a error occurs by converting the image
   * @throws {Error} If a unsupported error on resizing of converting of the image happens
   */
  public async convert(image: Buffer, width: number, height: number): Promise<Buffer> {
    this.logger.log(`Try to convert image to a size of ${width}x${height}`, 'debug');

    const format = await this.getFormat();

    try {
      const ret = await sharp(image)
        .resize(width, height)
        .ignoreAspectRatio()
        .background('white')
        .flatten()
        .toFormat(format)
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
