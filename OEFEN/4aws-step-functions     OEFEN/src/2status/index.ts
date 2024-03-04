// this functions checks if the payment was successfull --> we make requests to stripe
// the function returns to the state machine
// the state machine checks for certain key/value pair and based on this it runs onther functions

import { IStatusEvent } from '../../bin/types';
import { handleCloudwatchEvent } from '../0cloudWatch';

// export interface IStatusEvent {
//   pid: string;
//   user: boolean;
//   identity: string;
//   validatePrice: string;
//   products: IProduct[];
//
//   retries: number;
//   waitSeconds: number;
// }

// lazy loading
let stripe: Stripe;
let cloudWatchClient: CloudWatchClient;

export const statusHandler = async (
  event: IStatusEvent
): Promise<IStatusEvent | { status: 'CANCELED' }> => {
  try {
    // lazy loading
    if (!stripe)
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-08-16',
      });

    if (!cloudWatchClient) cloudWatchClient = new CloudWatchClient({});

    // destructure the event
    const { pid, user, identity, validatePrice, products, retries } = event;

    if (retries > 3) {
      handleCloudwatchEvent({
        // call function we created
        metricName: 'CanceledPaymentStatusMetrics',
        pid: pid,
        cw,
      });
      return { status: 'CANCELED' }; // ---------------------TEST-----------------------------------CANCELED
    }

    const retryCount = retries + 1;
    const waitTimeInSeconds = retryCount * 150; // 2,5 / 5 / 7,5 / 10 Total 25 min

    // 1 Get payment intent --> we use the stripe client based on the pid we get the paymentIntents
    const paymentIntents: Stripe.PaymentIntent =
      await stripe.paymentIntents.retrieve(pid);

    // check the status of the payment intent
    const status: Stripe.PaymentIntent.Status = paymentIntents.status; // status can have numerous values

    let shipping: Stripe.PaymentIntent.Shipping | null = null;
    let paymentMethode: string | Stripe.PaymentMethod | null = null;
    let receiptEmail: string | null = null;

    // 2 only when status is "succeeded"
    // Get the shipping and payment method if intent is successfull
    if (status === 'succeeded') {
      shipping = paymentIntents.shipping;
      paymentMethode = paymentIntents.payment_method;

      // get the receipt email
      // we fetch the email from stripe because we can have guest users which are not logged in therefore we haven't a email but when they pay they are obliged to give there email
      // when the payment was successfull we can get the email via the payment_method
      const retrievedPayment: Stripe.PaymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethode as string);

      receiptEmail = retrievedPayment.billing_details.email;
    }

    // when the status is "succeeded" OR when all the other values appear:
    // create the return statement function
    const returnStatement = (result: string) => ({
      pid,
      user,
      identity,
      validatePrice,
      products,
      //
      status: result,
      //
      retries: retryCount,
      waitSeconds: waitTimeInSeconds,
      // only when payment was successfull otherwise null
      shipping,
      receiptEmail,
      // paymentMethode    // we don't use it in the other
    });

    //
    const success = () => returnStatement('SUCCEEDED');
    const processing = () => returnStatement('PROCESSING');
    const canceled = () => returnStatement('CANCELED');

    const statusMatrix = {
      // create functions (that return function, that also returns a function)
      // these are all the options stripe 'status' can have
      succeeded: () => success(),
      processing: () => processing(),
      requires_action: () => processing(),
      requires_capture: () => processing(),
      requires_confirmation: () => processing(),
      required_payment_method: () => processing(),
      canceled: () => canceled(),
    };

    //
    return statusMatrix[status]() as IStatusEvent;
    //
    //
    //
    //
  } catch (err) {
    console.log(err);

    await handleCloudwatchEvent({
      metricName: 'FailedPaymentStatusMetrics',
      pid: event.pid,
      cloudWatchClient,
    });
    return { status: 'CANCELED' }; // ------------------------------------------CANCELED
  }
};
// the ouput of this lambda will be inside of the object with a key called payload.
// where do we return to???
