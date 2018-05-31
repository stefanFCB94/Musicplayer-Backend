import { BaseError } from '../BaseError';


/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error, which should be thrown, if
 * the configuration file for the HTTPS server
 * could not be found
 * 
 * @extends BaseError
 */
export class CertificateNotFoundError extends BaseError {

  /**
   * @property
   * @type: string
   * 
   * The path of the certificate file, which could not
   * be found
   */
  public certificate: string;

  constructor(certificate: string, msg?: string) {
    super(500, msg);

    this.certificate = certificate;
  }
}
