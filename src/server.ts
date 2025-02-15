import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './app';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { schema } from './schema';
import { createContext } from './context';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

const port = process.env.PORT || 4000;
const app = createServer();
const httpServer = http.createServer(app);
const endpoint = '/graphql';

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
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }), // Middleware untuk mengelola file upload
  );

  // Middleware untuk Apollo Server
  app.use(
    endpoint,
    expressMiddleware(apollo, {
      context: async ({ req, res }) => await createContext({ req, res }) // Menggunakan createContext
    })
  );

  // Middleware untuk melayani file statis dari folder "downloads"
  app.use('/downloads', express.static(path.join(__dirname + '../../', 'downloads')));

  app.listen(port, () => {
    console.log(`Server graphql is running on http://localhost:${port}${endpoint}`);
  });

};

startServer(app, apollo);