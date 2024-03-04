import { IPaymentIntenderEvent } from '../types';

import Stripe from 'stripe';
import { SFNClient } from '@aws-sdk/client-sfn';

import { HandleStartCommand } from '../utils/start-execution-command';
import { AppSyncIdentityCognito } from 'aws-lambda';

// export interface IPaymentIntenderEvent {
//   identity: AppSyncIdentityCognito | AppSyncIdentityIAM;
//   arguments: { order: { products: IProduct[] } };
// }

let stripeClient: Stripe;
let sfnClient: SFNClient;

const validateOrderPrice = (input: any) => 1000; // cent

export const handler = async (event: IPaymentIntenderEvent) => {
  //
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  if (!sfnClient) {
    sfnClient = new SFNClient({});
  }

  try {
    const validatedPrice = validateOrderPrice(event.arguments.order.products);

    const paymentIntent: Stripe.PaymentIntent =
      await stripeClient.paymentIntents.create({
        amount: validatedPrice,
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
      });

    //

    const validationEvent = JSON.stringify({
      pid: paymentIntent.id,
      user: true,
      identity: (event.identity as AppSyncIdentityCognito).sub,
      validatedPrice,
      products: event.arguments.order.products,
    });

    await HandleStartCommand({
      sfnClient,
      stateMachineArn: process.env.PAYMENT_PROCESSING_ARN!,
      validationEvent,
    });

    //

    return JSON.stringify({
      statusCode: 200,
      body: { clientSecret: paymentIntent.client_secret }, // with this we can pay
    });
  } catch (error) {
    return JSON.stringify({
      statusCode: 500,
      body: { clientSecret: null },
    });
  }
};
