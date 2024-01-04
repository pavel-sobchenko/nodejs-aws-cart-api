import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import * as process from "process";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput } from 'aws-cdk-lib';
require('dotenv').config();


export class CartStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartService = new NodejsFunction(this, 'CartService', {
      environment: {
        DB_URL: process.env.DB_URL!,
        DB_NAME: process.env.DB_NAME!,
        DB_USER: process.env.DB_USER!,
        DB_PASSWORD: process.env.DB_PASSWORD!,
        DB_PORT: process.env.DB_PORT!,
      },
      runtime: Runtime.NODEJS_18_X,
      functionName: 'integrationSQLDatabase',
      entry: '../dist/src/main.js',
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      bundling: {
        externalModules: [
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@nestjs/microservices',
          'class-validator',
          'class-transformer',
        ]
      }
    });

    const httpApi = new HttpApi(this, 'CartServiceApi', {
      description: 'API for Cart Service',
        corsPreflight: {
            allowHeaders: ['*'],
            allowMethods: [CorsHttpMethod.ANY],
            allowOrigins: ['*'],
            allowCredentials: false
        },
    });

    httpApi.addRoutes({
        path: '/{proxy+}',
        methods: [HttpMethod.ANY],
        integration: new HttpLambdaIntegration(
            'cart-service-integration',
            cartService
        )
      }
    );

    new CfnOutput(this, 'HTTP API Url', {
      value: `${httpApi.url}`,
      description: 'Cart Service HTTP API Url',
    });
  }
}
