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
  logger.debug('Error on request detected');
  logger.error(JSON.stringify(errorData, null, '\t'));

  return errorData;
}
