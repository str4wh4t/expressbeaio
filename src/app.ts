import express from 'express';
import type { Express } from 'express';

export const createServer = (): Express => {
  const app = express();

  return app;
};
