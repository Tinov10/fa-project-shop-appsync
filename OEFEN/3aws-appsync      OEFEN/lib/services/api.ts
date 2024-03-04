import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';

// How do we create a graphql api? What is the blueprint?

interface IApiProps {
  name: string;
  schemaPath: string;
  userPool: cognito.IUserPool;
}

export const GraphqlAPI = (stack: cdk.Stack, props: IApiProps) => {
  //
  const api = new appsync.GraphqlApi(stack, 'AppsyncApi', {
    // 1. general
    name: props.name,
    schema: appsync.SchemaFile.fromAsset(props.schemaPath),

    // 2. auth
    authorizationConfig: {
      // default USER POOL
      defaultAuthorization: {
        authorizationType: appsync.AuthorizationType.USER_POOL, // by default we have to add a cognito authorized user to the request
        userPoolConfig: {
          userPool: props.userPool, // link the userpool that we created inside cognito stack
        },
      },
      // additional IAM = guest users
      additionalAuthorizationModes: [
        { authorizationType: appsync.AuthorizationType.IAM },
      ],
    },

    // 3. logs
    logConfig: {
      // it creates a lambda for it automatically (so we see an extra lambda)
      fieldLogLevel: appsync.FieldLogLevel.ALL,
      retention: logs.RetentionDays.ONE_MONTH, // after 1 month the logs will be deleted (by default they won't get deleted)
    },
  });

  return api;
};
