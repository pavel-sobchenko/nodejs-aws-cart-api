import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import helmet from 'helmet';
require('dotenv').config();
import { AppModule } from './app.module';

import { Express } from "express";
import { INestApplication } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import { Server } from 'http';
import * as express from 'express';
import { createServer, proxy, Response } from 'aws-serverless-express';

const port = process.env.PORT || 4000;

let cachedServer: Server;

export async function createApp(
    expressApp: Express
): Promise<INestApplication> {
  const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp)
  );

  return app;
}

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//
//   app.enableCors({
//     origin: (req, callback) => callback(null, true),
//   });
//   app.use(helmet());
//
//   await app.listen(port);
// }
// bootstrap().then(() => {
//   console.log('App is running on %s port', port);
// });

async function bootstrap(): Promise<Server> {
  const expressApp = express();

  const app = await createApp(expressApp);
  //app.enableCors();
  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());
  await app.init();

  await app.listen(port);
  return createServer(expressApp);
}

export async function handler(event: any, context: Context): Promise<Response> {
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }

  return proxy(cachedServer, event, context, "PROMISE").promise;
}
