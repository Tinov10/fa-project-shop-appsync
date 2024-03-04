import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

interface IProps {
  id: string;
  tableName: string;
  dynamoDBClient: DynamoDBClient;
}

export const HandleDeleteAccount = async (props: IProps) => {
  // input
  const input: DeleteItemCommandInput = {
    TableName: props.tableName,
    Key: { account_id: { S: props.id } },
  };

  // command
  const command = new DeleteItemCommand(input);

  // output
  const output: DeleteItemCommandOutput = await props.dynamoDBClient.send(
    command
  );

  return output.$metadata.httpStatusCode;
};
