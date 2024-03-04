import { StackProps } from 'aws-cdk-lib';
import Stripe from 'stripe';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

export interface IAwsStepFunctionsStackProps extends StackProps {
  orderKeyArn: string;
  usersKeyArn: string;
  submit: {
    name: string;
    entry: string;
    env: { [key: string]: string };
  };
  status: {
    name: string;
    entry: string;
    env: { [key: string]: string };
  };
  finalize: {
    name: string;
    entry: string;
    env: { [key: string]: string };
  };
}

// Handlers

export interface ICloudWatchEvent {
  metricName: string;
  pid: string;
  cloudWatchClient: CloudWatchClient;
}

export interface ISubmitEvent {
  pid: string;
  user: boolean;
  identity: string; // sub of user or 'anonymous' (if we don't have IAM user)
  validatePrice: string; // total price of the products
  products: IProduct[];
}

export interface IProduct {
  id: number;
  price: number;
  quantity: number;
  color: String;
  size: String;
}

export interface IStatusEvent {
  pid: string;
  user: boolean;
  identity: string;
  validatePrice: string;
  products: IProduct[];
  //
  retries: number;
  waitSeconds: number;
}

export interface IFinalizeEvent {
  //
  pid: string;
  user: boolean;
  identity: string;
  validatedPrice: string;
  products: IProduct[];
  //
  shipping: Stripe.PaymentIntent.Shipping;
  receiptEmail: string;
}

// interacting with the dbs

export interface IUpdateCommand {
  orderId: string;
  orderDate: string;
  //
  // pid: string;         // no pid
  validatedPrice: string;
  identity: string;
  products: IProduct[];
}

export interface IPutCommand {
  // same as IFinalizeEvent
  orderId: string;
  orderDate: string;
  //
  pid: string;
  validatedPrice: string;
  identity: string;
  products: IProduct[];
  //
  receiptEmail: string;
  shipping: Stripe.PaymentIntent.Shipping;
}
