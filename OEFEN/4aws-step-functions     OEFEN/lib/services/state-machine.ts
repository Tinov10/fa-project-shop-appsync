import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export interface IStateMachineProps {
  definition: sfn.IChainable;
}

export const StateMachine = (stack: cdk.Stack, props: IStateMachineProps) => {
  return new sfn.StateMachine(stack, 'StateMachine', {
    stateMachineName: 'ph-payment-processing',
    comment: 'State Machine for Stripe Payment Processing',
    timeout: cdk.Duration.minutes(30),
    //
    definitionBody: sfn.DefinitionBody.fromChainable(props.definition), // props.definition
  });
};
