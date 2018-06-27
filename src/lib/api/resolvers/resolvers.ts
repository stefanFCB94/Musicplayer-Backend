import { ApiDate } from './scalars/Date';
import { ApiUUID } from './scalars/UUID';
import { ApiMail } from './scalars/Mail';

import { getUser } from './queries/getUser';
import { getUserByMail } from './queries/getUserByMail';

export const resolvers = {
  Query: {
    getUser,
    getUserByMail,
  },

  Date: ApiDate,
  UUID: ApiUUID,
  Mail: ApiMail,
};
