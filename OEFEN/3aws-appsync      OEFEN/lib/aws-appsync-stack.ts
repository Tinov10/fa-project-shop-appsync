import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IAwsAppsyncStackProps } from '../bin/types';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'; // dynamodb.Table     .fromTableName()
import * as kms from 'aws-cdk-lib/aws-kms'; // kms.Key            .fromKeyArn()
import * as cognito from 'aws-cdk-lib/aws-cognito'; // cognito.UserPool   .fromUserPoolArn()
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

import { GraphqlAPI } from './services/appsync/api';
import { Resolver } from './services/lambda-function';

export class AwsAppsyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IAwsAppsyncStackProps) {
    super(scope, id, props);

    /*----------------get------------------------------------------ */

    const customersTable = dynamodb.Table.fromTableName(
      this,
      'CustomersTable',
      props.customerTableName
    );
    const customersTableKey = kms.Key.fromKeyArn(
      this,
      'CustomerTableKey',
      props.customerTableKeyArn
    );

    // we pass it in to the api
    const userPool = cognito.UserPool.fromUserPoolArn(
      this,
      'UserPool',
      props.userPoolArn
    );

    const paymentIntentStateMachine = sfn.StateMachine.fromStateMachineArn(
      this,
      'PaymentIntentStateMachine',
      props.stepFunctionArn
    );

    /*------------------------------------------------------------------- */

    // 2. create resolvers / lambdas

    const paymentResolver = Resolver(this, {
      name: props.lambda.paymentIntender.name,
      entry: props.lambda.paymentIntender.entry,
      environment: props.lambda.paymentIntender.env,
    });

    /* PaymentResolver 
    
    The frontend will send an {} that will contain an order. This order will be validated on price inside the resolver and the resolver will send back the payment intender so you can pay with stripe. The resolver gets the payment intender from stripe. 
    */

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
    paymentIntentStateMachine.grantStartExecution(paymentResolver);

    /*------------------------------------------------------------------------------------ */

    // BLOCK 2

    // 6. create the api
    const api = GraphqlAPI(this, {
      name: props.apiName,
      schemaPath: props.schemaPath,
      userPool, // pass in the userpool
    });

    // 7. connect lambdas to api by creating a data source
    const paymentIntenderDS = api.addLambdaDataSource(
      'CreatePaymentIntentSource',
      paymentResolver
    );

    const customerOrdersDS = api.addLambdaDataSource(
      'CustomerOrderSource',
      customerResolver
    );

    const deleteAccountDS = api.addLambdaDataSource(
      'DeleteAccountSource',
      deleteResolver
    );

    // 8. map resolvers to the queries via the data source

    paymentIntenderDS.createResolver('Query-PaymentIntentResolver', {
      typeName: 'Query',
      fieldName: 'paymentIntent', // fieldName corresponds with schema.graphql
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    customerOrdersDS.createResolver('Query-CustomerOrderResolver', {
      typeName: 'Query',
      fieldName: 'getCustomerOrders', // fieldName corresponds with schema.graphql
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    deleteAccountDS.createResolver('Mutation-DeleteAccountResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteAccount', // fieldName corresponds with schema.graphql
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });
  }
}
