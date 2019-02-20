import { ResponseType } from '../interfaces/ResponseType';


export function get_error_data(error: Error | Error[]): ResponseType {
  if (!Array.isArray(error)) {
    error = [error];
  }

  return {
    data: null,
    errors: error.map(err => ({ type: err.constructor.name, message: err.message }))
  };
}
