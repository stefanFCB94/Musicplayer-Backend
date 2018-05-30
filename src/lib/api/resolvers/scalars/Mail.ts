import * as EMailValidator from 'email-validator';
import { GraphQLScalarType, StringValueNode, Kind } from 'graphql';
import { InvalidMailAddressError } from '../../../error/request/InvalidMailAddressError';

function checkMail(mail: string) {
  if (EMailValidator.validate(mail)) {
    return mail;
  }

  throw new InvalidMailAddressError(mail, 'Not a valid mail address');
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

    throw new InvalidMailAddressError(ast.value, 'Not a valid mail address');
  },
});
