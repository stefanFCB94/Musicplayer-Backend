import { container } from '../../../inversify.config';
import { ILogger } from '../../../interfaces/services/ILogger';
import { TYPES } from '../../../types';
import { GraphQLError } from 'graphql';
import { BaseError } from '../../../error/BaseError';

export function formatError(error: { originalError: BaseError }) {
  const errorData = {
    type: error.originalError.constructor.name,
    message: error.originalError.message,
    code: error.originalError.code,
    ...error.originalError,
  };

  const logger = container.get<ILogger>(TYPES.Logger);
  logger.log('Error on request detected', 'debug');
  logger.log(JSON.stringify(errorData, null, '\t'), 'error');

  return errorData;
}
