import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import egoTokenMiddleware from 'kfego-token-middleware';
import * as env from './env';
import { version, name, description } from '../package.json';

const app = express();

// CORS middleware
app.use(cors());

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
        route: [`/(.*)/download`],
        status: ['approved'],
        role: 'user',
      },
      {
        type: 'allow',
        route: [`/(.*)/ping`, '/status'],
        tokenExempt: true,
      },
    ],
  }),
);

// Health check endpoint
app.get('/status', (req, res) =>
  res.send({
    name,
    version,
    description,
    elasticsearch: env.ES_HOST,
  }),
);

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/download", (req, res) => {
  res.send("download...");
});


// start to listen
app.listen(env.PORT, () => {
  console.log(`app is listening to port ${env.PORT}`);
});
