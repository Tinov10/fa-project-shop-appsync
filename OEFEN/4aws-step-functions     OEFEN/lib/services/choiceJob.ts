import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-tasks';

interface IChoiseJob {
  failedJob: sfn.Fail;
  finalizeTask: tasks.LambdaInvoke;
  waitJob: sfn.Wait;
}

export const createChoiseJob = (stack: cdk.Stack, props: IChoiseJob) => {
  //
  const job = new sfn.Choise(stack, 'Job Complete?') // "Job Complete?"" is what we see in the diagram

    /*
    We check what we get from the StatusJobTask what do we find inside the "status"
   
    inside "status" we can find: 
    1) CANCELED
    2) SUCCEEDED
    3) PROCESSING
    */

    .when(sfn.Condition.stringEquals('$.status', 'CANCELED'), props.failedJob)

    .when(
      sfn.Condition.stringEquals('$.status', 'SUCCEEDED'),
      props.finalizeTask
    )
    // otherwise is PROCESSING
    .otherwise(props.waitJob);
};
