import { Stack } from 'aws-cdk-lib';
import {
  GraphqlApi,
  SchemaFile,
  AuthorizationType,
  FieldLogLevel,
} from 'aws-cdk-lib/aws-appsync';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface IApiProps {
  name: string;
  schemaPath: string;
  userPool: IUserPool;
}

export const GraphqlAPI = (stack: Stack, props: IApiProps) => {
  return new GraphqlApi(stack, 'AppsyncApi', {
    logConfig: {
      fieldLogLevel: FieldLogLevel.ALL,
      retention: RetentionDays.ONE_MONTH,
    },
    authorizationConfig: {
      //
      defaultAuthorization: {
        authorizationType: AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool: props.userPool,
        },
      },
      additionalAuthorizationModes: [
        { authorizationType: AuthorizationType.IAM },
      ],
    },
    name: props.name,
    schema: SchemaFile.fromAsset(props.schemaPath),
  });
};
