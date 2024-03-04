import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { AppSyncIdentityCognito } from 'aws-lambda';

import { HandleDeleteAccount } from '../utils/delete-customer-account';

interface IDeleteAccountEvent {
  identity: AppSyncIdentityCognito;
}

let dynamoDBClient: DynamoDBClient;

export const handler = async (event: IDeleteAccountEvent) => {
  if (!dynamoDBClient) {
    dynamoDBClient = new DynamoDBClient({});
  }

  try {
    const sub = event.identity.sub;

    if (sub) {
      const tableSuccess = await HandleDeleteAccount({
        dynamoDBClient,
        id: sub,
        tableName: process.env.CUSTOMERS_TABLE_NAME!,
      });

      if (tableSuccess === 200) {
        //
        return JSON.stringify({
          statusCode: 200,
          body: JSON.stringify({
            message: 'Account deleted',
          }),
        });
      }
    }

    return JSON.stringify({
      statusCode: 400,
      body: JSON.stringify({
        message: 'Account not found',
      }),
    });
  } catch (err) {
    console.log('error', err);

    return JSON.stringify({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed deleting account',
      }),
    });
  }
};
