import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Function, Code, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { resolve } from 'path';
import { ApiConstruct } from './api.construct';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nestLambda = new lambda.Function(this, 'NestLambda', {
      functionName: 'NestLambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('../dist/src'),
    });

    new apigateway.LambdaRestApi(this, 'NestApi', {
      handler: nestLambda,
    });

    // new ApiConstruct(this, 'ApiConstruct', {});
  }
}
