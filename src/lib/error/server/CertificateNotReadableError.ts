import { BaseError } from '../BaseError';

/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be thrown if
 * the certificate file for the HTTPS server could
 * not be read, because of missing read permission
 * 
 * @extends BaseError
 */
export class CertificateNotReadableError extends BaseError {

  /**
   * @property
   * @type string
   * 
   * The path of the certificate file, which
   * is not readable
   */
  public certificate: string;

  constructor(certificate: string, msg?: string) {
    super(500, msg);

    this.certificate = certificate;
  }
}
