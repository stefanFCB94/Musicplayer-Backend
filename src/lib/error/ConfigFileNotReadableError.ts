/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error, which should be thrown, when the 
 * configuration file could not be read, because of
 * insufficient file permissions
 * 
 * @extends Error
 */

export class ConfigFileNotReadableError extends Error {}
