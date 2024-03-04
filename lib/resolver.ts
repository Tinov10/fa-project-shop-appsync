import { Stack, Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface IResolverProps {
  name: string;
  entry: string;
  environment: { [key: string]: string };
}

export const Resolver = (stack: Stack, props: IResolverProps) => {
  return new NodejsFunction(stack, props.name, {
    bundling: {
      minify: true,
      sourceMap: true,
      target: 'es2020',
    },
    environment: props.environment,
    logRetention: RetentionDays.TWO_WEEKS,

    memorySize: 1024,
    entry: props.entry, // src/ x / index.ts
    timeout: Duration.seconds(30),

    handler: 'index/handler',
    runtime: Runtime.NODEJS_18_X,

    functionName: props.name,
  });
};
