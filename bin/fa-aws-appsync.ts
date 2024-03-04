#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppsyncStack } from '../lib/fa-aws-appsync-stack';
import { StackConfig } from './config';

const app = new cdk.App();
new AppsyncStack(app, 'AppsyncStack', StackConfig);
