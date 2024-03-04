/* eslint-disable max-lines */

// 1. import all the handlers from src/
import * as submitHandler from '../src/1submit';
import * as statusHandler from '../src/2status';
import * as finalizeHandler from '../src/3finalize';

// 2. mock aws client
import { MockClient } from 'aws-sdkclient-mock'; // we can mock each of the aws services

// 3. get the dynamo client
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// 4. get the document client and the commands / inputs
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

// 5. get the cloudwatchclient and the putmetricdatacommand
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';

// 6. import the fixtures
import {
  submitEvent,
  statusEvent,
  finalizeEvent,
  finalizeUpdateInput,
} from './fixtures';

/*
submitEvent is send from the frontend
submitHandler sends statusEvent to the statusHandler
statusHandler checks the status of the payment and if SUCCESS send the finalizeEvent to the finalizeHandler 

*/

/*  Which aws services do we use and HOW do we need to mock? ---> very simple with MockClient()
1.  DynamoDBClient
2.  DynamoDBDocumentClient      what is the difference between the DB-Client and the DB-Document-Client?
3.  CloudWatchClient
*/

// 7. mock the aws services 
const ddbMock = MockClient(DynamoDBClient);
const ddbMockClient = MockClient(DynamoDBDocumentClient);
const cwMockClient = MockClient(CloudWatchClient);

/* Which Stripe functions do we use and HOW do we need to mock? 
1.  paymentIntents      stripe.paymentIntents used inside the statusHandler
2.  paymentMethods      stripe.paymentMethods used inside the statusHandler 
*/

// 8. mock stripe 
const stripePaymentIntentMock = jest.fn()
const stripePaymentMethodMock = jest.fn()

jest.mock('stripe', () => ({
  paymentIntents: {
    retrieve: stripePaymentIntentMock
  }, 
  paymentMethods: {
    retrieve: stripePaymentMethodMock
  }
}))

// 9. mock uuid 
jest.mock('uuid', () => ({
  __esModule: true, 
  v4(): jest.fn().mockReturnValue('9890809-098989-78676-8787787')
}))


// 10. Actual tests 

describe('Lambda Functions', () => {

  beforeEach(() => {

    jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => '2023-09-43595-45435')
    // add environment variables before each test  
    process.env = Object.assign(process.env, {
      WAIT_SECONDS: '150', 
      STRIPE_SECRET_KEY: '',
      ORDERS_TABLE_NAME: '',
      CUSTOMER_TABLE_NAME: '',
    })
  })

  afterEach(() => {

    jest.spyOn(Date.prototype, 'toISOString').mockRestore()
    stripePaymentIntentMock.mockReset()
    stripePaymentMethodMock.mockReset()
    ddbMock.reset()
    ddbMockClient.reset()
    cwMockClient.reset()
  })

  describe('Submit function', () => {
    test('Should submit a new order', () => {
      // we call the function that we want to test
      // we pass in the fixture 
      const result = await submitHandler(submitEvent)
      // the function does something and returns something 
      // we expect something back from the functions that looks like: 
      expect(result).toEqual({
        ...submitEvent, retries: 0, waitSeconds: 150
      })
    })
  })

  describe('Status function', () => {

    [{status: 'succeeded', expected: 'SUCCEEDED', receiptEmail: '', shipping: {}}].map((input) => {
      test(`stripe ${input.status} status`, async () => {
        stripePaymentIntentMock.mockResolvedValueOnce({status: input.status, shipping: input.shipping, paymentMethod: 'paymentMethod'})

      })
    })
    test('Should submit a new order', () => {
      // we call the function that we want to test
      // we pass in the fixture 
      const result = await submitHandler(submitEvent)
      // the function does something and returns something 
      // we expect something back from the functions that looks like: 
      expect(result).toEqual({
        ...submitEvent, retries: 0, waitSeconds: 150
      })
    })
  })

})