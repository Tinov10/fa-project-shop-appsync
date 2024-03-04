// create type for the event / object we receive inside the handlers from the frontend
// every handler has an Event so we have 3 events

/*
Difference between AppSyncIdentity-Cognito, AppSyncIdentity-IAM

IAM can be an anonymous user. In this case we can't fetch orders or delete the user. We can however fetch the paymentIntent from stripe. 

*/

import { AppSyncIdentityCognito, AppSyncIdentityIAM } from 'aws-lambda';

export interface IProduct {
  id: number;
  price: number;
  quantity: number;
  color: String;
}

// what we receive from the frontend
export interface IPaymentIntenderEvent {
  identity: AppSyncIdentityCognito | AppSyncIdentityIAM; // we don't do anything with it right now
  arguments: { order: { products: IProduct[] } };
}

export interface ICustomerOrdersEvent {
  identity: AppSyncIdentityCognito;
}

export interface IDeleteAccountEvent {
  identity: AppSyncIdentityCognito; // we have a event.identity.sub // sub is unique identifier
}
