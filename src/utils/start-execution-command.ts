import {
  StartExecutionCommand,
  StartExecutionCommandInput,
  StartExecutionCommandOutput,
} from '@aws-sdk/client-sfn';
import { SFNClient } from '@aws-sdk/client-sfn';

interface IStartExecutionCommandProps {
  stateMachineArn: string;
  validationEvent: any;
  sfnClient: SFNClient;
}

export const HandleStartCommand = async (
  props: IStartExecutionCommandProps
) => {
  // create input
  const input: StartExecutionCommandInput = {
    stateMachineArn: props.stateMachineArn,
    input: props.validationEvent,
  };

  //command
  const command = new StartExecutionCommand(input);

  // output
  const output: StartExecutionCommandOutput = await props.sfnClient.send(
    command
  );
};
