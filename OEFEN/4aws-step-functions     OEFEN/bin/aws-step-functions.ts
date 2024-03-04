import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsStepFunctionsStack } from '../lib/aws-step-functions-stack';
import { stackProps } from './config';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();

// we pass in all the props that we can use inside the stack
new AwsStepFunctionsStack(app, 'AwsStackFunctionsStack', stackProps);

cdk.Aspects.of(app).add(new AwsSolutionsChecks());
