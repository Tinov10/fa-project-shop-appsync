#!/user/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { AwsAppsyncStack } from '../lib/aws-appsync-stack';
import { StackConfig } from './config';

const app = new cdk.App();
new AwsAppsyncStack(app, 'AwsAppsyncStack', StackConfig);

// cdk.stack vs cdk.App()
