import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";

import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from "aws-cdk-lib/aws-lambda";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";

require('dotenv').config();

const TEST_GITHUB_ACCOUNT_LOGIN = process.env.TEST_GITHUB_ACCOUNT_LOGIN!;
const TEST_PASSWORD = process.env.TEST_PASSWORD!;
const API_GATEWAY_ARN_IMPORT = process.env.API_GATEWAY_ARN_IMPORT!;

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizerLambda = new NodejsFunction(this, 'basicAuthorizer', {
      functionName: 'basicAuthorizerLambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, './handlers/basic-authorizer/index.js'),
      handler: 'handler',
      environment: {
        TEST_GITHUB_ACCOUNT_LOGIN,
        TEST_PASSWORD
      }
    });

    basicAuthorizerLambda.addPermission('ApiGatewayPermissionImportGet', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: API_GATEWAY_ARN_IMPORT,
    });
  }
}
