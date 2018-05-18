/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which should be called, if the configuration
 * is not loaded form the file into the service, but that would
 * be required
 * 
 * @extends Error
 */

export class ConfigNotLoadedError extends Error {}
