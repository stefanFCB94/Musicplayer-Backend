import { ApiDate } from './scalars/Date';
import { ApiUUID } from './scalars/UUID';
import { ApiMail } from './scalars/Mail';

import { getUser } from './queries/getUser';

export const resolvers = {
  Query: {
    getUser,
  },

  Date: ApiDate,
  UUID: ApiUUID,
  Mail: ApiMail,
};
