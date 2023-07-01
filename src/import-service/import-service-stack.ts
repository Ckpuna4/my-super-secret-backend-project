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

const BUCKET_NAME = process.env.BUCKET_NAME as string;
const BUCKET_REGION = process.env.BUCKET_REGION as string;
const QUEUE_URL = process.env.QUEUE_URL as string;
const QUEUE_ARN = process.env.QUEUE_ARN as string;

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApi = new apiGateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Api',
      description: 'handlers for Import Service',
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowMethods: ['GET', 'OPTIONS'],
        allowOrigins: ['https://dgaojw28dgevx.cloudfront.net'],
      },
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

    const importResource = restApi.root.addResource('import');
    const importProductFileLambdaIntegration = new apiGateway.LambdaIntegration(importProductFileLambda);
    importResource.addMethod('GET', importProductFileLambdaIntegration, {
      requestParameters: {
        'method.request.querystring.name': true
      },
      requestValidatorOptions: {
        validateRequestParameters: true
      }
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
