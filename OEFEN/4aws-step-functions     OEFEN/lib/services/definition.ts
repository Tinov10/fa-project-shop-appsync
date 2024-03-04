// final product of the stepfunction
// how does the structure of the state machine looks like
// a lambda invokes the state machine
// in total we have 3 lambdas --> because we have 3 tasks

/*
What is happening? 

A lambda submits an event to the first job (waitJob). This lambda sends an event = {} to this job. The job receives the event but not as an prop! 




After this lambda has invoked. The next step is waiting for a certain time. After waiting we execute the status task which is another lambda. After the lambda has ran. We will check with the step function choise if this job has been completed. How do we know if it is completed? We will look inside the object that the status task gives us. If the status task gives us an object with {status: 'CANCELLED'} in this case we execute the task failed job which is a special step functions function. When we receive {status: 'SUCCEEDED'}. We will run the final lambda finalize task. The finalize task will do all the db updates. If we don't have {status: 'SUCCEEDED' / 'CANCELLED' }. This can be because it is still processing we go back to the waitJob. Untill it fails or runs out of time. 

Question: we do we have {status: 'SUCCEEDED'}? What do we check? 
*/

import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

interface IDefenitionProps {
  submitTask: tasks.LambdaInvoke;
  waitJob: sfn.Wait;
  statusTask: tasks.LambdaInvoke;
  choiseJob: sfn.Choise;
}

export const createDefinition = (props: IDefenitionProps) => {
  return props.submitTask
    .next(props.waitJob)
    .next(props.statusTask)
    .next(props.choiseJob);
};

/*

  We can't see what is happening inside the choiseJob therefore see below 

    We check what we get from the StatusJobTask what do we find inside the "status"
   
    inside "status" we can find: 
    1) CANCELED
    2) SUCCEEDED
    3) PROCESSING
    
    .when(sfn.Condition.stringEquals('$.status', 'CANCELED'), props.failedJob)

    .when(
      sfn.Condition.stringEquals('$.status', 'SUCCEEDED'),
      props.finalizeTask
    )
    // otherwise is PROCESSING
    .otherwise(props.waitJob);

*/
