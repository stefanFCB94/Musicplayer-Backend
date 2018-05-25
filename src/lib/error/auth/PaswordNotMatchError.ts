/**
 * @class
 * @author Stefan Läufle
 * 
 * Custom error, which should be used, when the password
 * form the request not matches the saved password in
 * the database.
 */

export class PasswordNotMatchError extends Error {}
