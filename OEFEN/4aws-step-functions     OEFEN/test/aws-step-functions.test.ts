import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib-assertens';

import * as AwsStackFunctions from '../lib/aws-step-functions-stack';
import { stackProps } from '../bin/config';

// create app
const app = new cdk.app();
// pass in app
const stack = new AwsStackFunctions.AwsStepFunctionsStack(
  app,
  'MyTestStack',
  stackProps
);
// get template based on stack
const template = Template.fromStack(stack);

test('01 Lambdas created', () => {
  // what do we expect to have?
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'submitJob',
    Handler: 'index.handler',
    Runtime: 'nodejs18.x', // coming from Construct
    Timeout: 60, // coming from Construct
  });

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'statusJob',
    Handler: 'index.handler',
    Runtime: 'nodejs18.x', // coming from Construct
    Timeout: 60, // coming from Construct
  });

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'finalizeJob',
    Handler: 'index.handler',
    Runtime: 'nodejs18.x', // coming from Construct
    Timeout: 60, // coming from Construct
  });
});

test('02 StateMachine created', () => {
  template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
    StateMachineName: 'ph-payment-processing',
  });
});
