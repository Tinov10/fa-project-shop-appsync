import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IStackProps } from '../bin/types';

import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { MappingTemplate } from 'aws-cdk-lib/aws-appsync';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';

import { GraphqlAPI } from './graphqlAPI';
import { Resolver } from './resolver';

export class AppsyncStack extends Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    /*----------------get------------------------------------------ */

    const customersTable = Table.fromTableName(
      this,
      'CustomersTable',
      props.customerTableName
    );
    const customersTableKey = Key.fromKeyArn(
      this,
      'CustomerTableKey',
      props.customerTableKeyArn
    );

    const userPool = UserPool.fromUserPoolArn(
      this,
      'UserPool',
      props.userPoolArn
    );

    const stateMachine = StateMachine.fromStateMachineArn(
      this,
      'PaymentIntentStateMachine',
      props.stepFunctionArn
    );

    // 2. create resolvers / lambdas

    const paymentResolver = Resolver(this, {
      name: props.lambda.paymentIntender.name,
      entry: props.lambda.paymentIntender.entry,
      environment: props.lambda.paymentIntender.env,
    });

    const customerResolver = Resolver(this, {
      name: props.lambda.customerOrder.name,
      entry: props.lambda.customerOrder.entry,
      environment: props.lambda.customerOrder.env,
    });

    const deleteResolver = Resolver(this, {
      name: props.lambda.deleteAccount.name,
      entry: props.lambda.deleteAccount.entry,
      environment: props.lambda.deleteAccount.env,
    });

    // 3. add permissions to Lambdas
    customersTable.grantReadData(customerResolver);
    customersTable.grantReadWriteData(deleteResolver);

    // 4. add permissions to every single lambda to use the key to encrypt / decrypt the data for the db
    customersTableKey.grantEncryptDecrypt(customerResolver);
    customersTableKey.grantEncryptDecrypt(deleteResolver);

    // 5. grant permission to start the stateMachine
    stateMachine.grantStartExecution(paymentResolver);

    // 6. create the api
    const api = GraphqlAPI(this, {
      name: props.apiName,
      schemaPath: props.schemaPath,
      userPool, // pass in the userpool
    });

    // 7. connect lambdas to api by creating a data source
    const paymentIntentDS = api.addLambdaDataSource(
      'PaymentIntentDS',
      paymentResolver
    );

    const customerOrdersDS = api.addLambdaDataSource(
      'CustomerOrderDS',
      customerResolver
    );

    const deleteAccountDS = api.addLambdaDataSource(
      'DeleteAccountDS',
      deleteResolver
    );

    // 8. map resolvers to the queries via the data source

    paymentIntentDS.createResolver('Query-PaymentIntentResolver', {
      typeName: 'Query',
      fieldName: 'paymentIntent', // fieldName corresponds with schema.graphql
      //
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });

    customerOrdersDS.createResolver('Query-CustomerOrderResolver', {
      typeName: 'Query',
      fieldName: 'getCustomerOrders', // fieldName corresponds with schema.graphql
      //
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });

    deleteAccountDS.createResolver('Mutation-DeleteAccountResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteAccount', // fieldName corresponds with schema.graphql
      //
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    });
  }
}
