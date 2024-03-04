import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';

interface IGetOrdersProps {
  sub: any;
  tableName: string;
}

export const GetOrdersCommand = (props: IGetOrdersProps) => {
  // create input
  const input: GetItemCommandInput = {
    TableName: props.tableName,
    Key: { account_id: { S: props.sub } },
    ProjectionExpression: 'orders',
  };

  // create command
  const command = new GetItemCommand(input);

  return command;
};
