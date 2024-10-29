import dotenv from 'dotenv';
dotenv.config();
import { createServer } from './app';
import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema';
import { createContext } from './context';
import type express from 'express';


const port = process.env.PORT || 4000;

const apollo = new ApolloServer({
  schema,
  context: createContext,
});

const startServer = async (app: express.Application, apollo: ApolloServer) => {
  await apollo.start();
  apollo.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  });
};

const app = createServer();

startServer(app, apollo);
