import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from "path";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

require('dotenv').config();

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME as string;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME as string;

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing table names
    const existingTableNames = [PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME];

    // Retrieve the ARNs of multiple existing DynamoDB tables
    const existingTableArns = existingTableNames.map(tableName => {
      return dynamodb.Table.fromTableName(this, `${tableName}Table`, tableName).tableArn;
    });

    // Grant additional permissions for Scan operation
    const dynamoDBPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:TransactWriteItems"
      ],
      resources: existingTableArns,
    });

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

    const utilsFolder = path.join(__dirname, '..', 'utils');

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
      environment: {
        PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME,
      },
      code: lambda.Code.fromAsset(getProductsListFolder),
      handler: 'index.handler',
      layers: [utilsLayer],
    });
    lambdaFunction.addToRolePolicy(dynamoDBPolicy);

    // Create an integration between the API Gateway and the Lambda function
    const lambdaIntegration = new apiGateway.LambdaIntegration(lambdaFunction);
    productsResource.addMethod('GET', lambdaIntegration);

    const createProductFolder = path.join(__dirname, 'handlers', 'create-product');
    const lambdaCreateProductFunction = new lambda.Function(this, 'createProduct', {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME,
      },
      code: lambda.Code.fromAsset(createProductFolder),
      handler: 'index.handler',
      layers: [utilsLayer],
    });
    lambdaCreateProductFunction.addToRolePolicy(dynamoDBPolicy);

    // Create an integration between the API Gateway and the Lambda function
    const lambdaCreateProductIntegration = new apiGateway.LambdaIntegration(lambdaCreateProductFunction);
    productsResource.addMethod('POST', lambdaCreateProductIntegration);


    const getProductsByIdResource = productsResource.addResource('{productId}');
    const getProductsByIdFolder = path.join(__dirname, 'handlers', 'get-products-by-id');
    const getProductsByIdLambdaFunction = new lambda.Function(this, 'getProductsById', {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCTS_TABLE_NAME,
        STOCKS_TABLE_NAME,
      },
      code: lambda.Code.fromAsset(getProductsByIdFolder),
      handler: `index.handler`,
      layers: [utilsLayer],
    });
    getProductsByIdLambdaFunction.addToRolePolicy(dynamoDBPolicy);
    const getProductsByIdLambdaIntegration = new apiGateway.LambdaIntegration(getProductsByIdLambdaFunction);
    getProductsByIdResource.addMethod('GET', getProductsByIdLambdaIntegration);

    new cdk.CfnOutput(this, 'apiUrl', {value: restApi.url});
  }
}
