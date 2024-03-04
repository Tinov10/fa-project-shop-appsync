// What do we need?

/*

SPECIFIC 

add authentication to graphql wo we need the      userPoolArn                                  for api 

where is the graphql schema located?              schemaPath      'graphql/schema.graphql'     for api 

stripeSecretKey secret key for stripe api         stripeSecretKey           
basePrice 
smallPrice 
bigPrice 

GENERAL 

name of the api                                   apiName                                      for api 
fetch data out of the db's so the name            customerTableName 
customerTableKey = kms                            customerTableKey 

*/

export interface IAwsAppsyncStackProps extends StackProps {
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
