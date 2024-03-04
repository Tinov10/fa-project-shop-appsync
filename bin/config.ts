import { IStackProps } from './types';

export const StackConfig: IStackProps = {
  userPoolArn: '',
  apiName: '',

  customerTableName: '',
  customerTableKeyArn: '',

  stepFunctionArn: '',

  schemaPath: 'graphl/schema.graphql',

  stripeSecretKey: '',

  basePrice: '39.95',
  smallPrice: '4.50',
  bigPrice: '7.50',

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
      entry: 'src/get-customer-orders/index.ts',
      env: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        CUSTOMERS_TABLE_NAME: 'customerTableName',
      },
    },
    deleteAccount: {
      name: 'DeleteAccountResolver',
      entry: 'src/delete-customer-account/index.ts',
      env: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        CUSTOMERS_TABLE_NAME: 'customerTableName',
      },
    },
  },
};
