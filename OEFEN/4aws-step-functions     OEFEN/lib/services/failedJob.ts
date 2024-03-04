import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export const createFailedJob = (stack: cdk.Stack) => {
  //
  const job = new sfn.Fail(stack, 'FailedJob', {
    // "FailedJob" is what we see in the diagram
    cause: 'Job Failed',
    error: 'Job Failed',
  });
  //
  return job;
};

/*
sfn.    Wait
        Fail
        Choise
        Condition
*/
