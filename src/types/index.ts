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
