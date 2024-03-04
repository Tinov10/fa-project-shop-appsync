import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

interface IResolverProps {
  name: string;
  entry: string;
  environment: { [key: string]: string };
}

export const Resolver = (stack: cdk.Stack, props: IResolverProps) => {
  const resolver = new nodejs.NodejsFunction(stack, props.name, {
    //
    functionName: props.name,
    entry: props.entry,
    handler: 'index/handler',
    //
    runtime: lambda.Runtime.NODEJS_18_x,
    memorySize: 1024,
    timeout: cdk.Duration.seconds(30),
    //
    logRetention: logs.RetentionDays.TWO_WEEKS,
    //
    bundling: {
      minify: true,
      sourceMap: true,
      target: 'es2020',
    },
    environment: props.environment,
  });

  return resolver;
};
