// so we have a logged in user with this data we can
// 1 delete the user from the db
// 2 delete the user from cognito (this are 2 separate things!!!!)

// export interface IDeleteAccountEvent {
//   identity: AppSyncIdentityCognito; // we have a event.identity.sub
//   info: { fieldName: string }; // sub is unique identifier
// }

// event.identity.sub = unique identifier    String like uuid

// we have interaction with the db so we import and create a function
import {
  DynamoDBClient,
  DeleteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';

import { AppSyncIdentityCognito } from 'aws-lambda';

import { DeleteAccountCommand } from '../utils/delete-account-command';

interface IDeleteAccountEvent {
  identity: AppSyncIdentityCognito; // we have a event.identity.sub // sub is unique identifier
}

let client: DynamoDBClient;

export const handler = async (event: IDeleteAccountEvent) => {
  if (!client) client = new DynamoDBClient({});

  try {
    const { sub } = event.identity;

    if (sub) {
      const command = DeleteAccountCommand({
        sub,
        tableName: process.env.CUSTOMERS_TABLE_NAME,
      });

      const result: DeleteItemCommandOutput = await client.send(command);

      if (result.$metadata.httpStatusCode === 200) {
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
    //
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
