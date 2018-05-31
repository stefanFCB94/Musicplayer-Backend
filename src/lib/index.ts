import { container } from './inversify.config';
import { TYPES } from './types';
import { IServer } from './interfaces/IServer';

// const schemaTypes = importSchema(__dirname + '/api/schema/schema.graphql');
// const schema = makeExecutableSchema({ resolvers, typeDefs: schemaTypes });

// const GRAPHQL_PORT = 3000;
// const server = express();

// server.use('/graphql', bodyParser.json(), graphqlExpress({ schema, formatError }));
// server.use('/graphiql',  graphiqlExpress({ endpointURL: '/graphql' }));


// server.listen(GRAPHQL_PORT, () => {
//   console.log('Server is now listening');

//   process.on('SIGINT', async () => {
//     const dbService = container.get<IDatabaseService>(TYPES.DatabaseService);
//     await dbService.closeConnection();

//     process.exit(0);
//   });
// });

async function start() {
  const server = container.get<IServer>(TYPES.Server);

  try {
    await server.start();

    process.on('SIGINT', () => server.stop());
  } catch (err) {}
}

start();
