// will just contain the CLOUDWATCHEVENT so we can use it throughout all the 3 lambda functions

// it is the same as in the post signup function, there we also created a cloudWatch event

// we export an cloudWatchEvent that we can use in all 3 functions --> the event sends to cloudWatch

// when do we use this cloudWatchEvent?

/*

Places where we use it: 

*/

import {
  PutMetricDataCommand,
  PutMetricDataCommandInput,
} from '@aws-sdk/client-cloudwatch';

import { ICloudWatchEvent } from '../../bin/types';

// export interface ICloudWatchEvent {
//   metricName: string;
//   pid: string;
//   cw: CloudWatchClient;
// }

export const handleCloudwatchEvent = async (props: ICloudWatchEvent) => {
  const input: PutMetricDataCommandInput = {
    MetricData: [
      {
        MetricName: props.metricName,
        Unit: 'Count',
        Value: 1,
        TimeStamp: new Date(),
        Dimensions: [
          {
            Name: props.metricName,
            Value: props.pid,
          },
        ],
      },
    ],
    Namespace: 'PrintHelix',
  };

  const command: PutMetricDataCommand = new PutMetricDataCommand(input);

  // we don't return we send to cloudWatch

  await props.cloudWatchClient.send(command);
};
