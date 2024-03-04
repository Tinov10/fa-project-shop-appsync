import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

interface ILambdaFunctionProps {
  name: string;
  entry: string;
  env: { [key: string]: string };
}

export const LambdaFunction = (
  stack: cdk.Stack,
  props: ILambdaFunctionProps // specific props (versus general props of the whole stack)
) => {
  const lambdaFunction = new nodejs.NodejsFunction(stack, props.name, {
    functionName: props.name,
    entry: props.entry,
    environment: props.env,
    //
    handler: 'index/handler',
    //

    timeout: cdk.Duration.seconds(60),
    runtime: lambda.Runtime.NODEJS_18_X,
    logRetention: logs.RetentionDays.ONE_MONTH,
    //
    memorySize: 1024,
    bundling: {
      minify: true,
      sourceMap: true,
      target: 'es2020',
    },
  });

  const cloudWatchPolicy = new iam.PolicyStatement({
    actions: ['cloudwatch:PutMetricData'],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  });

  lambdaFunction.addToRolePolicy(cloudWatchPolicy);

  return lambdaFunction;
};

// create infrastructure of the lambda
// 21,46
