import { IAwsAppsyncStackProps } from './types';

export const StackConfig: IAwsAppsyncStackProps = {
  customerTableName: '',
  customerTableKeyArn: '',
  userPoolArn: '',
  stepFunctionArn: '',

  apiName: '',

  schemaPath: 'graphl/schema.graphql',

  stripeSecretKey: '',

  basePrice: '',
  smallPrice: '',
  bigPrice: '',

  lambda: {
    paymentIntender: {
      name: 'PaymentIntenderResolver',
      entry: 'src/payment-intender/index.ts',
      env: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        PAYMENT_PROCESSING_ARN: 'stepFunctionArn',
      },
    },
    customerOrder: {
      name: 'GetOrderResolver',
      entry: 'src/customer-orders/index.ts',
      env: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        CUSTOMERS_TABLE_NAME: 'customerTableName',
      },
    },
    deleteAccount: {
      name: 'DeleteAccountResolver',
      entry: 'src/delete-account/index.ts',
      env: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        CUSTOMERS_TABLE_NAME: 'customerTableName',
      },
    },
  },
};
