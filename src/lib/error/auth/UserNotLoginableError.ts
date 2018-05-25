/**
 * @class
 * @author Stefan Läufle
 * 
 * A custom error, which shows, that a login if for
 * a specific user is not possible, because he so
 * configured in the database
 */

export class UserNotLoginableError extends Error {}
