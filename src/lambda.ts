import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import { Server } from 'http';
import { Context } from "aws-lambda";
import { createApp } from "./main";

const serverlessHandler = require('serverless-http');
const port = process.env.PORT || 4000;

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
    const expressApp = express();
  
    const app = await createApp(expressApp);
    app.enableCors();
    await app.init();
  
    return createServer(expressApp);
  }

export async function handler(event: any, context: Context): Promise<Response> {
if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
}

return proxy(cachedServer, event, context, "PROMISE").promise;
}

