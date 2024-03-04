import { StackProps } from 'aws-cdk-lib';

export interface IStackProps extends StackProps {
  userPoolArn: string;
  apiName: string; // name of the graphql api
  //
  customerTableName: string;
  customerTableKeyArn: string; // kms key
  //
  stepFunctionArn: string;
  //
  schemaPath: string; // path to graphql schema

  stripeSecretKey: string; // for stripe api

  basePrice: string;
  smallPrice: string;
  bigPrice: string;

  lambda: {
    paymentIntender: {
      name: string;
      entry: string;
      env: { [key: string]: string };
    };
    customerOrder: {
      name: string;
      entry: string;
      env: { [key: string]: string };
    };
    deleteAccount: {
      name: string;
      entry: string;
      env: { [key: string]: string };
    };
  };
}
