import * as cdk from 'aws-cdk-lib';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { IFunction } from 'aws-cdk-lib/lambda';

interface ITaskProps {
  name: string;
  lambdaFunction: IFunction;
}

export const Task = (stack: cdk.Stack, props: ITaskProps) => {
  return new tasks.LambdaInvoke(stack, props.name, {
    lambdaFunction: props.lambdaFunction,
    //
    outputPath: '$.Payload', // we define what we want to return to the stateMachine = only the return of the lambda which is in the Payload key
  });
};

// tasks gets triggered and the the lambdas inside the task run when the task get triggered

// normally we return a string inside the lambda. In this case we don't return a string. What is returned inside the lambda will also be returned too the stepfunction state machine. Inside the return value there is field called "Payload". The payload is populated with the outcome of the lambda.

// The event get processed and the step function will have an output. This output is big object with all the details of the state and the runtime AND a key of "Payload". This Payload will contain the output of the lambda function. And we only want to forward this Payload part to the next function. So not the whole big {} from the stepfunction.

// how many tasks do we have? 3

// The lambda is inside the task. The task outputs to the stateMachine.
