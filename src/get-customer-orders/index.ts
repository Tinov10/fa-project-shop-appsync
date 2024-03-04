import { DynamoDBClient, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AppSyncIdentityCognito } from 'aws-lambda';

import { HandleGetOrders } from '../utils/get-customer-orders-command';

let dynamoDBClient: DynamoDBClient;

interface ICustomerOrdersEvent {
  identity: AppSyncIdentityCognito;
}

export const handler = async (event: ICustomerOrdersEvent) => {
  if (!dynamoDBClient) {
    dynamoDBClient = new DynamoDBClient({});
  }

  try {
    const sub = event.identity.sub;

    if (sub) {
      const { Item } = await HandleGetOrders({
        dynamoDBClient,
        tableName: process.env.ORDERS_TABLE_NAME!,
        id: sub,
      });

      if (Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(Item),
        };
      }
    }

    return JSON.stringify({
      statusCode: 400,
      body: JSON.stringify({
        message: 'Account not found',
      }),
    });
  } catch (err) {
    return JSON.stringify({
      statusCode: 500,
      body: {
        message: 'Failed to fetch',
      },
    });
  }
};
