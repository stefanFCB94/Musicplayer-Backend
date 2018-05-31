import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown if the
 * path, setted as certifcate file for the HTTPS
 * server, is not a file but a directory
 * 
 * @extends BaseError
 */
export class CertificateNotAFileError extends BaseError {

  /**
   * @property
   * @author Stefan Läufle
   * 
   * The path, which was detect is not a certificate file
   */
  public certificate: string;

  constructor(certificate: string, msg?: string) {
    super(500, msg);

    this.certificate = certificate;
  }
}
