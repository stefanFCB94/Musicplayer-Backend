import { BaseError } from '../../../error/BaseError';

export function sendError(err: BaseError) {
  return {
    errors: [
      {
        ...err,
        type: err.constructor.name,
        message: err.message,
        code: err.code,
      },
    ],
  };
}
