import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from "path";

export class MySuperSecretBackendProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the API Gateway
    const restApi = new apiGateway.RestApi(this, 'ProductApi', {
      restApiName: 'Product Api',
      description: 'handlers for Product Service',
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowMethods: ['GET', 'OPTIONS'],
        allowOrigins: ['https://dgaojw28dgevx.cloudfront.net'],
      },
    });

    const mockFolder = path.join(__dirname, 'mocks');
    const mockLayer = new lambda.LayerVersion(this, 'mock-layer', {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X,
      ],
      code: lambda.Code.fromAsset(mockFolder),
      description: 'mocks',
    });

    const utilsFolder = path.join(__dirname, 'utils');

    const utilsLayer = new lambda.LayerVersion(this, 'utils-layer', {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X,
      ],
      code: lambda.Code.fromAsset(utilsFolder),
      description: 'utils',
    });

    const productsResource = restApi.root.addResource('products');
    const getProductsListFolder = path.join(__dirname, 'handlers', 'get-products-list');
    // Create the Lambda function
    const lambdaFunction = new lambda.Function(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(getProductsListFolder),
      handler: 'index.handler',
      layers: [mockLayer, utilsLayer],
    });
    // Create an integration between the API Gateway and the Lambda function
    const lambdaIntegration = new apiGateway.LambdaIntegration(lambdaFunction);
    productsResource.addMethod('GET', lambdaIntegration);

    const getProductsByIdResource = productsResource.addResource('{productId}');
    const getProductsByIdFolder = path.join(__dirname, 'handlers', 'get-products-by-id');
    const getProductsByIdLambdaFunction = new lambda.Function(this, 'getProductsById', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(getProductsByIdFolder),
      handler: `index.handler`,
      layers: [mockLayer, utilsLayer],
    });
    const getProductsByIdLambdaIntegration = new apiGateway.LambdaIntegration(getProductsByIdLambdaFunction);
    getProductsByIdResource.addMethod('GET', getProductsByIdLambdaIntegration);

    new cdk.CfnOutput(this, 'apiUrl', {value: restApi.url});
  }
}
