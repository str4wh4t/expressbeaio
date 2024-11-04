import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './app';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from './schema';
import { createContext } from './context';
import express from 'express';
import http from 'http';
import cors from 'cors';

const port = process.env.PORT || 4000;
const app = createServer();
const httpServer = http.createServer(app);

const apollo = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

const startServer = async (app: express.Application, apollo: ApolloServer) => {
  await apollo.start();
  // apollo.applyMiddleware({ app });

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req, res }) => await createContext({ req, res }) // Menggunakan createContext
    })
  );

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  });
};

startServer(app, apollo);
