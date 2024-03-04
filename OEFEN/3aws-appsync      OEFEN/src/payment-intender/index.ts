/*

We receive an order from the frontend. We validate the order and send back the "stripe client_secret" so we can pay in the frontend.. 

*/

import { IPaymentIntenderEvent } from '../types';

import Stripe from 'stripe';
import { SFNClient } from '@aws-sdk/client-sfn';

import { validatePrice } from '../utils/validatePrice';

import { createStartCommand } from '../utils/start-execution-command';
import { AppSyncIdentityCognito } from 'aws-lamda';

// clients
let stripeClient: Stripe;
let sfnClient: SFNClient;

export const handler = async (event: IPaymentIntenderEvent) => {
  try {
    //
    if (!stripeClient)
      stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-08-16',
      });

    if (!sfnClient) sfnClient = new SFNClient({});

    // 1. check price
    const validatedPrice = validatePrice(event.arguments.order.products);

    // 2. create payment intent with stripe client
    const paymentIntentResult: Stripe.PaymentIntent =
      await stripeClient.paymentIntent.create({
        amount: validatedPrice,
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
      });

    // the paymentIntent has a id and a client_secret                --> send back to the frontend
    // the id is send to the stateMachine the client_secret is send back to the client    --> send to the stateMachine

    /*-------------------------------------------------------------------------------- */

    // create the event for the state machine which must be a string
    const validationEvent = JSON.stringify({
      pid: paymentIntentResult.id, // from the payment intent we created above we get the id
      user: true, // we don't use IAM if we would we woudn't have a user and we woudn't have a sub
      identity: (event.identity as AppSyncIdentityCognito).sub,
      validatedPrice,
      products: event.arguments.order.products,
    });

    // create the command and use the event
    const command = createStartCommand({
      stateMachineArn: process.env.PAYMENT_PROCESSING_ARN,
      validationEvent,
    });

    // send the command
    await sfnClient.send(command);

    // this is what the SubmitHandler receives

    // export interface ISubmitEvent {
    //   pid: string;
    //   user: boolean;
    //   identity: string; // sub of user or 'anonymous' (if we don't have IAM user)
    //   validatePrice: string; // total price of the products
    //   products: IProduct[];
    // }

    /*------------------------------------------------------------------------------------ */

    return JSON.stringify({
      statusCode: 200,
      body: { clientSecret: paymentIntentResult.client_secret }, // with this we can pay
    });
  } catch (error) {
    return JSON.stringify({
      statusCode: 500,
      body: { clientSecret: null },
    });
  }
};
