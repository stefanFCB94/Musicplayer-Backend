import { GraphQLScalarType, IntValueNode, Kind } from 'graphql';

// tslint:disable-next-line:variable-name
export const ApiDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date format for the api',
  parseValue: (value) => {
    return new Date(value);
  },
  serialize: (value: Date) => {
    return value.getTime();
  },
  parseLiteral: (ast: IntValueNode) => {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }

    return null;
  },
});
