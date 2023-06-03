#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MySuperSecretBackendProjectStack } from './my-super-secret-backend-project-stack';

const app = new cdk.App();

new MySuperSecretBackendProjectStack(app, 'MySuperSecretBackendProjectStack');

