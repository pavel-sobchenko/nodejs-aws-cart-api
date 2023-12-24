import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import { Server } from 'http';
import helmet from 'helmet';

const serverlessHandler = require('serverless-http');
const port = process.env.PORT || 4000;

//---1-----*/
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: (req, callback) => callback(null, true),
//   });
//   app.use(helmet());

//   await app.listen(port);
// }
// bootstrap().then(() => {
//   console.log('App is running on %s port', port);
// });

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express),
  );
  await app.init();

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());
  await app.listen(port);

  return express;
}

export const handler = async (event: any, context: any) => {
    const app = await bootstrap();
    return serverlessHandler(app, event, context);
};

/*---2---*/
// let cachedServer: Server;

// const bootstrap = async () => {
//   const expressApp = express();
//   const adapter = new ExpressAdapter(expressApp);
//   const app = await NestFactory.create(AppModule, adapter);
//   await app.init();
//   return createServer(expressApp);
// };

// export const handler = async (event, context) => {
//     if (!cachedServer) {
//       cachedServer = await bootstrap();
//     }
//     return proxy(cachedServer, event, context, 'PROMISE').promise;
//   };

