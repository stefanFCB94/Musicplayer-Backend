import * as express from 'express';
import * as bodyParser from 'body-parser';

import { importSchema } from 'graphql-import';
import { resolvers } from './api/resolvers/resolvers';
import { makeExecutableSchema } from 'graphql-tools';
import { formatError } from './api/resolvers/errors/formatError';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { container } from './inversify.config';
import { IDatabaseService } from './interfaces/db/IDatabaseService';
import { TYPES } from './types';

const schemaTypes = importSchema(__dirname + '/api/schema/schema.graphql');
const schema = makeExecutableSchema({ resolvers, typeDefs: schemaTypes });

const GRAPHQL_PORT = 3000;
const server = express();

server.use('/graphql', bodyParser.json(), graphqlExpress({ schema, formatError }));
server.use('/graphiql',  graphiqlExpress({ endpointURL: '/graphql' }));


server.listen(GRAPHQL_PORT, () => {
  console.log('Server is now listening');

  process.on('SIGINT', async () => {
    const dbService = container.get<IDatabaseService>(TYPES.DatabaseService);
    await dbService.closeConnection();

    process.exit(0);
  });
});
