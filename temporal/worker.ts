import { Worker } from '@temporalio/worker';
import { deliveryService } from '@services/deliveryService';
import { createDeliveryActivity } from '@activities/createDeliveryActivity';
import { calculateRouteActivity } from '@activities/calculateRouteActivity';

async function run() {
  const activities = {
    createDeliveryActivity: (input: any) => createDeliveryActivity(input, deliveryService),
    calculateRouteActivity,
  };

  const worker = await Worker.create({
    workflowsPath: require.resolve('@workflows/createDeliveryWorkflow'),
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
