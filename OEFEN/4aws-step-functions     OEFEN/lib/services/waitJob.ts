import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export const createWaitJob = (stack: cdk.Stack) => {
  //
  const job = new sfn.Wait(stack, 'Wait X Seconds', {
    // "Wait X Seconds" is what we see in the diagram
    // we can find the number of seconds inside the "waitSeconds"
    // the waitSeconds-key is inside the {} we receive from the previous Task which is the submitTask
    time: sfn.WaitTime.secondsPath('$.waitSeconds'),
  });
  //
  return job;
};

/*

The waitJob is triggered by the submitTask. A task is always connected to a lambda. The submitTask passes down: 

export interface ISubmitEvent {
  pid: string;
  user: boolean;
  identity: string; // sub of user or 'anonymous' (if we don't have IAM user)
  validatePrice: string; // total price of the products
  products: IProduct[];
}



*/
