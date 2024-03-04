import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// TODO: import { NagSuppressions } from 'cdk-nag';

import { IAwsStepFunctionsStackProps } from '../bin/types';

import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';

import {
  LambdaFunction,
  Task,
  createChoiseJob,
  createFailedJob,
  createWaitJob,
  createDefinition,
  StateMachine,
} from './services';

export class AwsStepFunctionsStack extends cdk.stack {
  constructor(
    scope: Construct,
    id: string,
    props: IAwsStepFunctionsStackProps
  ) {
    super(scope, id, props);

    /*----------------get------------------ */

    const ordersKey = kms.Key.fromKeyArn(this, 'OrdersKey', props.orderKeyArn);
    const usersKey = kms.Key.fromKeyArn(this, 'UsersKey', props.usersKeyArn);

    const ordersTable = ddb.Table.fromTableName(
      this,
      'OrdersTable',
      props.finalize.env.ORDERS_TABLE_NAME
    );
    const usersTable = ddb.Table.fromTableName(
      this,
      'CustomerTable',
      props.finalize.env.CUSTOMER_TABLE_NAME
    );

    /*---------------------lambdas----------------- */

    const submitJobLambda = LambdaFunction(this, {
      name: props.submit.name,
      entry: props.submit.entry, // passing down the general stack props
      env: props.submit.env,
    });

    const statusJobLambda = LambdaFunction(this, {
      name: props.status.name,
      entry: props.status.entry, // passing down the general stack props
      env: props.status.env,
    });

    const finalizeJobLambda = LambdaFunction(this, {
      name: props.finalize.name,
      entry: props.finalize.entry, // passing down the general stack props
      env: props.finalize.env,
    });

    /*---------------permissions--------------------- */
    ordersTable.grantWriteData(finalizeJobLambda);
    usersTable.grantWriteData(finalizeJobLambda);

    ordersKey.grantEncryptDecrypt(finalizeJobLambda);
    usersKey.grantEncryptDecrypt(finalizeJobLambda);

    /*----------------tasks-------------------------- */

    const submitJobTask = Task(this, {
      name: 'SubmitJobTask',
      lambdaFunction: submitJobLambda,
    });

    const statusJobTask = Task(this, {
      name: 'StatusJobTask',
      lambdaFunction: statusJobLambda,
    });

    const finalizeJobTask = Task(this, {
      name: 'FinalizeJobTask',
      lambdaFunction: finalizeJobLambda,
    });

    /*-------------jobs----------------------------- */
    // jobs does not contrain a lambda only task have lambdas
    // however the ChoiseJob receives 2 jobs and 1 task as props
    const waitJob = createWaitJob(this);

    const failedJob = createFailedJob(this);

    const choiseJob = createChoiseJob(this, {
      waitJob,
      finalizeTask: finalizeJobTask,
      failedJob,
    });

    /*-------------------------------------------------- */
    // 7. create the definition
    // the Definition holds all the TASKS and all the JOBS
    // we pas in the 3 jobs and 3 tasks as props
    // the definition defines how the state machine works: what is the order of all tasks and jobs
    const definition = createDefinition({
      submitTask: submitJobTask,

      waitJob,

      statusTask: statusJobTask,

      choiseJob,
    });

    // 8. create the statemachine
    // we pass in the definition as a prop
    StateMachine(this, { definition });
  }
}
