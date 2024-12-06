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
import morgan from 'morgan';

const port = process.env.PORT || 4000;
const app = createServer();
const httpServer = http.createServer(app);

const apollo = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000']; // fallback ke nilai default untuk semua nilai falsy, termasuk null, undefined, string kosong '', atau array kosong []

// Konfigurasi opsi CORS
const corsOptions: cors.CorsOptions = {
  origin: CLIENT_ORIGIN, // Alamat asal yang diizinkan
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], // Metode HTTP yang diizinkan
  credentials: true, // Mengizinkan pengiriman cookie atau header Authorization
};

const startServer = async (app: express.Application, apollo: ApolloServer) => {
  await apollo.start();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Menampilkan log request ke console
  }

  app.use(
    cors<cors.CorsRequest>(corsOptions),
    express.json(), // Agar bisa mengurai body berformat JSON dan menjadikannya object
    expressMiddleware(apollo, {
      context: async ({ req, res }) => await createContext({ req, res }) // Menggunakan createContext
    })
  );

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  });
};

startServer(app, apollo);
