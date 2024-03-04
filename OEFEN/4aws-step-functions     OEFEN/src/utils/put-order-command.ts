import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { IPutCommand } from '../../bin/types';

// create the put command to insert a entry inside the orders table

export const createPutOrderCommand = (props: IPutCommand) => {
  // create input
  const input: PutCommandInput = {
    TableName: process.env.ORDERS_TABLE_NAME,
    Item: {
      payment_id: props.pid,
      price: props.validatedPrice,
      account_id: props.identity,
      receipt_email: props.receiptEmail,
      products: props.products,
      shipping: props.shipping,
      //
      order_id: `PHO-${props.orderId}`,
      order_date: props.orderDate,
      //
      shipment_date: 'PENDING',
      order_status: 'PENDING',
    },
  };

  // create command
  const command = new PutCommand(input);

  return command;
};
