import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as path from "path";
import * as iam from 'aws-cdk-lib/aws-iam';

import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
require('dotenv').config();

const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_REGION = process.env.BUCKET_REGION!;
const QUEUE_URL = process.env.QUEUE_URL!;
const QUEUE_ARN = process.env.QUEUE_ARN!;
const AUTH_LAMBDA_NAME = process.env.AUTH_LAMBDA_NAME!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': "'*'",
  'Access-Control-Allow-Headers': "'*'",
  'Access-Control-Allow-Methods': "'OPTIONS,GET'"
};

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApi = new apiGateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Api',
      description: 'handlers for Import Service',
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowMethods: ['GET', 'OPTIONS'],
        allowOrigins: ['*'],
      },
    });

    restApi.addGatewayResponse('GatewayResponseUNAUTHORIZED', {
      type: apiGateway.ResponseType.UNAUTHORIZED,
      responseHeaders: CORS_HEADERS
    });
    restApi.addGatewayResponse('GatewayResponseACCESS_DENIED', {
      type: apiGateway.ResponseType.ACCESS_DENIED,
      responseHeaders: CORS_HEADERS
    });

    const importProductFileLambda = new NodejsFunction(this, 'importProductFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, './handlers/import-products-file/index.js'),
      handler: 'handler',
      environment: {
        BUCKET_NAME,
        BUCKET_REGION
      }
    });

    const s3AccessPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`arn:aws:s3:::${BUCKET_NAME}/uploaded/*`],
    });
    importProductFileLambda.addToRolePolicy(s3AccessPolicy);

    const basicAuthorizerLambda = lambda.Function.fromFunctionArn(
        this,
        'basicAuthorizerFromArn',
        `arn:aws:lambda:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
        }:function:${AUTH_LAMBDA_NAME}`,
    );

    const authorizer = new apiGateway.RequestAuthorizer(this, 'MySuperDuperAuthorizer', {
      authorizerName: 'mySuperDuperAuthorizer',
      handler: basicAuthorizerLambda,
      identitySources: [apiGateway.IdentitySource.header('Authorization')],
      resultsCacheTtl: cdk.Duration.seconds(0)
    });

    const importResource = restApi.root.addResource('import');
    const importProductFileLambdaIntegration = new apiGateway.LambdaIntegration(importProductFileLambda);
    importResource.addMethod('GET', importProductFileLambdaIntegration, {
      requestParameters: {
        'method.request.querystring.name': true
      },
      requestValidatorOptions: {
        validateRequestParameters: true
      },
      authorizer,
      authorizationType: apiGateway.AuthorizationType.CUSTOM,
    });


    const bucket = s3.Bucket.fromBucketName(this, 'ImportBucket', BUCKET_NAME);

    const importFileParser = new NodejsFunction(this, 'importFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, './handlers/import-file-parser/index.js'),
      handler: 'handler',
      environment: {
        BUCKET_NAME,
        BUCKET_REGION,
        QUEUE_URL,
      }
    });

    const parserS3AccessPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
      resources: [`arn:aws:s3:::${BUCKET_NAME}/uploaded/*`, `arn:aws:s3:::${BUCKET_NAME}/parsed/*`],
    });
    importFileParser.addToRolePolicy(parserS3AccessPolicy);

    const sqsPolicy = new iam.PolicyStatement({
      actions: ['sqs:SendMessage'],
      resources: [QUEUE_ARN],
    });
    importFileParser.addToRolePolicy(sqsPolicy);

    bucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3notifications.LambdaDestination(importFileParser),
        {
          prefix: 'uploaded/'
        }
    );
  }
}
