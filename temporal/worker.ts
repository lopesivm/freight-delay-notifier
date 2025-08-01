import { Worker } from '@temporalio/worker';
import { deliveryService } from '@services/deliveryService';
import { createDeliveryActivity } from '@activities/createDeliveryActivity';
import { calculateRouteActivity } from '@activities/calculateRouteActivity';
import { updateDeliveryLocationActivity } from '@activities/updateDeliveryLocationActivity';
import { notifyDelayActivity } from '@activities/notifyDelayActivity';
import { generateDelayMessageActivity } from '@activities/generateDelayMessageActivity';
import { updateDeliveryStatusActivity } from '@activities/updateDeliveryStatusActivity';

async function run() {
  const activities = {
    createDeliveryActivity: (input: any) => createDeliveryActivity(input, deliveryService),
    calculateRouteActivity,
    updateDeliveryLocationActivity: (input: any) =>
      updateDeliveryLocationActivity(input, deliveryService),
    notifyDelayActivity,
    generateDelayMessageActivity,
    updateDeliveryStatusActivity,
  };

  const worker = await Worker.create({
    workflowsPath: require.resolve('@workflows/deliveryLifecycleWorkflow'),
    activities,
    taskQueue: 'FREIGHT_DELAY_Q',
  });

  console.log('Worker started with dependency injection');
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
