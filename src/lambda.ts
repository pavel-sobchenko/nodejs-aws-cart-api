import * as express from 'express';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { Context } from "aws-lambda";
import { Server } from 'http';
import { createApp } from "./main";

const port = process.env.PORT || 4000;

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
    const expressApp = express();

    const app = await createApp(expressApp);
    app.enableCors();
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
