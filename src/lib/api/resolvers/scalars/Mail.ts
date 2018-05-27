import * as EMailValidator from 'email-validator';
import { GraphQLScalarType, StringValueNode, Kind } from 'graphql';

function checkMail(mail: string) {
  if (EMailValidator.validate(mail)) {
    return mail;
  }

  throw new TypeError('Not a valid mail address');
}

// tslint:disable-next-line:variable-name
export const ApiMail = new GraphQLScalarType({
  name: 'Mail',
  description: 'A email address',
  parseValue: checkMail,
  serialize: checkMail,
  parseLiteral: (ast: StringValueNode) => {
    if (ast.kind === Kind.STRING) {
      return checkMail(ast.value);
    }

    throw new TypeError('Not a valid mail address');
  },
});
