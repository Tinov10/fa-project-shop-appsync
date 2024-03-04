import {
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

interface IProps {
  id: string;
  tableName: string;
  dynamoDBClient: DynamoDBClient;
}

export const HandleGetOrders = async (props: IProps) => {
  // input
  const input: GetItemCommandInput = {
    TableName: props.tableName,
    Key: { account_id: { S: props.id } }, // account_id
    ProjectionExpression: 'orders', // 'orders'
  };

  // command
  const command = new GetItemCommand(input);

  // output
  const output: GetItemCommandOutput = await props.dynamoDBClient.send(command);

  return output;
};
