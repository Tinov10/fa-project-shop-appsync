import { IAwsStepFunctionsStackProps } from './types';

export const stackProps: IAwsStepFunctionsStackProps = {
  orderKeyArn: '',
  usersKeyArn: '',
  // lambdas
  submit: {
    name: 'submitJob',
    entry: 'src/submit/index.ts',
    env: { WAIT_SECONDS: '150' },
  },
  status: {
    name: 'statusJob',
    entry: 'src/status/index.ts',
    env: {
      STRIPE_SECRET_KEY: '',
    },
  },
  finalize: {
    name: 'finalizeJob',
    entry: 'src/finalize/index.ts',
    env: {
      ORDERS_TABLE_NAME: '',
      CUSTOMER_TABLE_NAME: '',
      STOCK_TABLE_NAME: '',
    },
  },
};
