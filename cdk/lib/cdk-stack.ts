import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { resolve } from 'path';


export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaLayer = new lambda.LayerVersion(this, 'NestLayer', {
      code: lambda.Code.fromAsset(resolve(__dirname, '../node_modules')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X]
    });

    const nestLambda = new lambda.Function(this, 'NestLambda', {
      functionName: 'NestLambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda.handler',
      layers: [lambdaLayer],
      code: lambda.Code.fromAsset('../dist'),
      environment: {
        NODE_PATH: "$NODE_PATH:/opt"
      }
    });

    new apigateway.LambdaRestApi(this, 'NestApi', {
      handler: nestLambda,
    });
  }
}
