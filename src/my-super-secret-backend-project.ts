#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AuthorizationServiceStack} from "./authorization-service/authorization-service-stack";
import {ProductServiceStack} from './product-service/product-service-stack';
import {ImportServiceStack} from './import-service/import-service-stack';

const app = new cdk.App();

new AuthorizationServiceStack(app, 'AuthorizationServiceStack')
new ProductServiceStack(app, 'ProductServiceStack');
new ImportServiceStack(app, 'ImportServiceStack');

