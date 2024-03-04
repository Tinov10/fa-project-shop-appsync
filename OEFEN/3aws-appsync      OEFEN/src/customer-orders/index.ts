import { DynamoDBClient, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AppSyncIdentityCognito } from 'aws-lambda';

import { GetOrdersCommand } from '../utils/get-orders-command';

let client: DynamoDBClient;

interface ICustomerOrdersEvent {
  identity: AppSyncIdentityCognito;
}

export const handler = async (event: ICustomerOrdersEvent) => {
  if (!client) client = new DynamoDBClient({});
  //
  try {
    const { sub } = event.identity;

    if (sub) {
      const command = GetOrdersCommand({
        sub,
        tableName: process.env.ORDERS_TABLE_NAME,
      });

      const result: GetItemCommandOutput = await client.send(command);

      if (result.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(result.Item),
        };
      }
    }

    return JSON.stringify({
      statusCode: 400,
      body: JSON.stringify({
        message: 'Account not found',
      }),
    });
    //
  } catch (err) {
    //
    return JSON.stringify({
      statusCode: 500,
      body: {
        message: 'Failed to fetch',
      },
    });
  }
};
