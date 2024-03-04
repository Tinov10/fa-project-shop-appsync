import {
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';

// delete the account of a user (not in cognitio this is a separate action)

interface IDeleteCommandProps {
  sub: any;
  tableName: string;
}

export const DeleteAccountCommand = (props: IDeleteCommandProps) => {
  // create input
  const input: DeleteItemCommandInput = {
    TableName: props.tableName,
    Key: { account_id: { S: props.sub } },
  };

  // create command
  const command = new DeleteItemCommand(input);

  return command;
};
