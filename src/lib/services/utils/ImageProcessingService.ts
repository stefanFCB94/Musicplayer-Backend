import * as sharp from 'sharp';

import { inject } from 'inversify';
import { TYPES } from '../../types';

import { ILogger } from '../../interfaces/services/ILogger';
import { IImageProcessingService } from '../../interfaces/services/IImageProcessingService';

import { BaseSystemPreferenceService } from '../../base/BaseSystemPreferenceService';
import { ISystemPreferencesService } from '../../interfaces/services/ISystemPreferencesService';

import { ImageProcessingError } from '../../error/media/ImageProcessingError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Serivce class, which can be used to handle image transformations.
 * 
 * The service offers basic functions to format a image to different
 * formats and sizes. Service can be used to convert cover or artist
 * images.
 * 
 * @extends BaseSystemPreferenceService
 */
export class ImageProcessingService extends BaseSystemPreferenceService implements IImageProcessingService {

  private formatKey = 'IMAGES.FORMAT';
  private formatDefault = 'JPEG';
  private formatAllowed = ['JPG', 'JPEG', 'PNG'];

  constructor(
    @inject(TYPES.SystemPreferencesService) prefrences: ISystemPreferencesService,
  ) {
    super(prefrences);
  }


  /**
   * @private
   * @author Stefan Läufle
   * 
   * Initalize the image processing service by setting the
   * config values and the configuration for the system 
   * preferences.
   */
  private init() {
    this.systemPreferenceService.setAllowedValues(this.formatKey, this.formatAllowed);
    this.systemPreferenceService.setDefaultValue(this.formatKey, [this.formatDefault]);
  }


  /**
   * @public
   * @author Stefan Läufle
   * 
   * Get the format, which should be used as target format
   * in the coverting process for the images.
   * 
   * Function gets the value from the system preference 
   * service through the setted default value or the database
   * value.
   * 
   * @returns {Promise<string>} The format
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  public async getFormat(): Promise<string> {
    const format = await this.systemPreferenceService.getPreferenceValues(this.formatKey);

    if (!format || format.length === 0) {
      return null;
    }

    return format[0];
  }

  /**
   * @public
   * @author Stefan Läufle
   * 
   * Set the format, to which pictures should be converted.
   * Saves the setting to the database through the system
   * preference service
   * 
   * @param {string} format The new format 
   * 
   * @returns {Promise<void>}
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {ParameterOutOfBoundsError}
   * @throws {RequiredParameterNotSet}
   * @throws {InvalidConfigValueError}
   * @throws {Error}
   */
  public async setFormat(format: string): Promise<void> {
    await this.systemPreferenceService.savePreference(this.formatKey, [format]);
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
   * 
   * @throws {ServiceNotInitializedError}
   * @throws {Error}
   */
  private getSharpImageFormat(format: string): sharp.AvailableFormatInfo {
    if (format === 'JPG' || format === 'JPEG') {
      this.logger.debug('JPEG as image format');
      return sharp.format.jpeg;
    }

    if (format === 'PNG') {
      this.logger.debug('PNG as image format');
      return sharp.format.png;
    }

    this.logger.warn(`${format} is not supported as image format. JPEG is used as default format`);
    return sharp.format.jpeg;
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
    this.logger.debug(`Try to convert image to a size of ${width}x${height}`);

    const format = await this.getFormat();

    try {
      const ret = await sharp(image)
        .resize(width, height)
        .ignoreAspectRatio()
        .background('white')
        .flatten()
        .toFormat(this.getSharpImageFormat(format))
        .toBuffer();
      
      this.logger.debug('Resizing of image completed');

      return ret;
    } catch (err) {
      this.logger.error(err);

      const error = new ImageProcessingError('Error by processing image');
      this.logger.warn(error);
    
      throw error;
    }
  }

}
