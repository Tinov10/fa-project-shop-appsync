import {
  StartExecutionCommand,
  StartExecutionCommandInput,
} from '@aws-sdk/client-sfn';

interface IStartExecutionCommandProps {
  stateMachineArn: any;
  validationEvent: any;
}

export const createStartCommand = (props: IStartExecutionCommandProps) => {
  // create input
  const input: StartExecutionCommandInput = {
    stateMachineArn: props.stateMachineArn,
    input: props.validationEvent,
  };

  //create the command
  const command = new StartExecutionCommand(input);

  return command;
};
