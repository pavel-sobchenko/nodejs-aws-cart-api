import { Construct } from '@aws-cdk/core';
import { resolve } from 'path';
import {
  RestApi,
  LambdaIntegration,
} from '@aws-cdk/aws-apigateway';
import { Function, Code, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    // pack all external deps in layer
    const lambdaLayer = new LayerVersion(this, 'HandlerLayer', {
      code: Code.fromAsset(resolve(__dirname, '../api/node_modules')),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      description: 'Api Handler Dependencies',
    });

    // add handler to respond to all our api requests
    const handler = new Function(this, 'Handler', {
      code: Code.fromAsset(resolve(__dirname, '../api/dist'), {
        exclude: ['node_modules'],
      }),
      handler: 'main.api',
      runtime: Runtime.NODEJS_12_X,
      layers: [lambdaLayer],
      environment: {
        NODE_PATH: '$NODE_PATH:/opt',
      },
    });

    // add api resource to handle all http traffic and pass it to our handler
    const api = new RestApi(this, 'Api', {
      deploy: true,
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
      deployOptions: {
        stageName: 'v1',
      },
    });

    // add proxy resource to handle all api requests
    const apiResource = api.root.addProxy({
      defaultIntegration: new LambdaIntegration(handler)
    });

    // add api key to enable monitoring
    const apiKey = api.addApiKey('ApiKey');
    const usagePlan = api.addUsagePlan('UsagePlan', {
      apiKey,
      name: 'Standard',
    });

    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });
  }
}