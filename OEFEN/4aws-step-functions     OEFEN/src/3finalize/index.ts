// we only get in to this function if the status in the first step was 'succeeded'

// This function updates the databases: 1) user Table = update 2 ) orders Table = insert new
// we don't return anything to the lambda that triggered this state machine

// export interface IFinalizeEvent {
//   //
//   pid: string;
//   user: boolean;
//   identity: string;
//   validatedPrice: string;
//   products: IProduct[];

//   receiptEmail: string;
//   shipping: Stripe.PaymentIntent.Shipping;
// }

import { IFinalizeEvent } from '../../bin/types';
import { handleCloudwatchEvent } from '../0cloudWatch';

import {
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

import { createPutOrderCommand } from '../utils/put-order-command';
import { createUpdateAccountCommand } from '../utils/update-account-command';

let dynamoDBClient: DynamoDBDocumentClient;
let cloudWatchClient: CloudWatchClient;

export const handler = async (event: IFinalizeEvent) => {
  try {
    // lazy loading the clients

    if (!dynamoDBClient)
      dynamoDBClient = new DynamoDBDocumentClient.from(new DynamoDBClient({}));

    if (!cloudWatchClient) cloudWatchClient = new CloudWatchClient({});

    const orderId = uuidv4();
    const orderDate = new Date().toISOString();

    // deconstructure
    const {
      pid,
      validatedPrice,
      identity,
      receiptEmail,
      products,
      shipping,
      user,
    } = event;

    const putOrderCommand: PutCommand = createPutOrderCommand({
      pid,
      validatedPrice,
      identity,
      receiptEmail,
      products,
      shipping,
      //
      orderId,
      orderDate,
    });

    const putOrderResult: PutCommandOutput = await dynamoDBClient.send(
      putOrderCommand
    );

    // we only have a user when we have a Cognito user
    // when we have a IAM user = guest we can't update the customer table
    if (user) {
      const updateCommand: UpdateCommand = createUpdateAccountCommand({
        // no pid,
        validatedPrice,
        identity,
        // no receiptEmail
        products,
        //
        orderId,
        orderDate,
      });

      const updateResult: UpdateCommandOutput = await dynamoDBClient.send(
        updateCommand
      );
    }

    // TODO: send confirmation email
    // TODO: update stock table
  } catch (err) {
    console.error(err);

    // send to CloudWatch
    handleCloudwatchEvent({
      metricName: 'FailedPaymentFinalizationMetrics',
      pid: event.pid,
      cloudWatchClient,
    });
  }
};
