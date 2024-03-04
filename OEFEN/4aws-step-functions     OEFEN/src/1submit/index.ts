import { ISubmitEvent } from '../../bin/types';

// this is what we receive from appSync:

// export interface ISubmitEvent {
//   pid: string;
//   user: boolean;
//   identity: string; // sub of user or 'anonymous' (if we don't have IAM user)
//   validatePrice: string; // total price of the products
//   products: IProduct[];
// }

export const submitHandler = (event: ISubmitEvent) => {
  //
  // deconstructure the event
  const { pid, user, identity, validatePrice, products } = event;

  return {
    pid, // payment intender id
    user, // is the user logged in boolean (otherwise we have iam user = guest user)
    identity, // sub of the user = kinda like uuid or anonymous when we have guest user --> type = string
    validatePrice, // price of the products
    products, // array with all the products
    //
    // add 2 extra fields
    retries: 0,
    waitSeconds: Number(process.env.WAIT_SECONDS), // process.env is always string so convert to Number
  };
};
