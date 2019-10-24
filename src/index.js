import express from 'express';
import cors from 'cors';
import { Server } from 'http';

import egoTokenMiddleware from 'kfego-token-middleware';
import * as env from './env';

import statusEndpoint from './status';
import reportsEndpoint from './reports';

const app = express();
const http = Server(app);

// CORS middleware
app.use(
  cors({
    exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Disposition'],
  }),
);

// Ego authentication
app.use(
  egoTokenMiddleware({
    egoURL: env.EGO_URL,
    accessRules: [
      {
        type: 'allow',
        route: ['/', '/(.*)'],
        role: 'admin',
      },
      {
        type: 'deny',
        route: ['/', '/(.*)'],
        role: ['user'],
      },
      {
        type: 'allow',
        route: [`/(.*)/reports/(.*)`],
        status: ['approved'],
        role: 'user',
      },
      {
        type: 'allow',
        route: ['/status', '/'],
        tokenExempt: true,
      },
    ],
  }),
);

// Health check endpoint
app.get('/status', statusEndpoint);
app.get('/', statusEndpoint);

// endpoints to generate the reports
app.use('/reports', reportsEndpoint(env.ES_HOST));

// start to listen
http.listen(env.PORT, () => {
  console.log(`app is listening to port ${env.PORT}`);
  console.log('env', JSON.stringify(env, null, 2));
});
