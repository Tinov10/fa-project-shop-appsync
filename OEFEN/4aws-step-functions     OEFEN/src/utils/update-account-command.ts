// export interface IUpdateCommand {
//   oid: string;
//   orderDate: string;
//   //
//   pid: string;
//   validatePrice: string;
//   identity: string;
//   products: IProduct[];
// }

// import { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
// import { IUpdateCommand } from '../../bin/types';

// export const UpdateAccountCommand = (props: IUpdateCommand) => {};

import { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { IUpdateCommand } from '../../bin/types';

// create the Update command to insert a entry inside the orders table

export const createUpdateAccountCommand = (props: IUpdateCommand) => {
  //
  // create input
  const input: UpdateCommandInput = {
    TableName: process.env.CUSTOMER_TABLE_NAME,
    Key: { account_id: props.identity }, // account_id = primary key
    UpdateExpression: 'SET orders = list_append(orders, :order)',
    ExpressionAttributeValues: {
      ':order': [
        {
          price: props.validatedPrice,
          products: props.products,
          order_id: `PHO-${props.orderId}`,
          order_date: props.orderDate,
          //
          shipment_date: 'PENDING',
          order_status: 'PENDING',
        },
      ],
    },
  };

  // create command
  const command = new UpdateCommand(input);

  return command;
};
