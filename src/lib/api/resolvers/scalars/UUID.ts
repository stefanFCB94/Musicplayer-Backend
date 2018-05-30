import { GraphQLScalarType, StringValueNode, Kind } from 'graphql';
import { InvalidUUIDError } from '../../../error/request/InvalidUUIDError';


function checkValue(value: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)) {
    return value;
  }

  throw new InvalidUUIDError(value, 'UUID has wrong format'); 
}

// tslint:disable-next-line:variable-name
export const ApiUUID = new GraphQLScalarType({
  name: 'UUID',
  description: 'Unique identifier, used as ID for records',
  parseValue: checkValue,
  serialize: checkValue,
  parseLiteral(ast: StringValueNode) {
    if (ast.kind === Kind.STRING) {
      return checkValue(ast.value);
    }

    throw new InvalidUUIDError(ast.value, 'UUID has wrong format');
  },
});
