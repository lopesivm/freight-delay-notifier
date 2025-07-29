import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  continueAsNew,
} from '@temporalio/workflow';

import type { CreateDeliveryInput, Delivery } from '@typings';
import { AUTO_DELIVER_SECONDS, MAX_LOOPS_BEFORE_CAN } from '../constants';

const {
  createDeliveryActivity,
  calculateRouteActivity,
  updateDeliveryLocationActivity,
  notifyDelayActivity,
  generateDelayMessageActivity,
  updateDeliveryStatusActivity,
} = proxyActivities<{
  createDeliveryActivity: typeof import('../activities/createDeliveryActivity').createDeliveryActivity;
  calculateRouteActivity: typeof import('../activities/calculateRouteActivity').calculateRouteActivity;
  updateDeliveryLocationActivity: typeof import('../activities/updateDeliveryLocationActivity').updateDeliveryLocationActivity;
  notifyDelayActivity: typeof import('../activities/notifyDelayActivity').notifyDelayActivity;
  generateDelayMessageActivity: typeof import('../activities/generateDelayMessageActivity').generateDelayMessageActivity;
  updateDeliveryStatusActivity: typeof import('../activities/updateDeliveryStatusActivity').updateDeliveryStatusActivity;
}>({
  startToCloseTimeout: '30 seconds',
  scheduleToStartTimeout: '30 seconds',
  retry: {
    maximumAttempts: 5,
    initialInterval: '5 seconds',
    backoffCoefficient: 2,
  },
});

// ---------- Signals & Queries ----------
export const updateLocationSignal = defineSignal<[string]>('updateLocation');
export const markDeliveredSignal = defineSignal('markDelivered');
export const getDeliveryQuery = defineQuery<Delivery>('getDelivery');

interface DeliveryLifecycleInput extends CreateDeliveryInput {
  id: string;
  notifyThresholdSecs: number;
}

export async function deliveryLifecycleWorkflow(input: DeliveryLifecycleInput): Promise<void> {
  let isDelivered = false;
  let updateCount = 0;

  const { routeDurationSeconds } = await calculateRouteActivity({
    origin: input.origin,
    destination: input.destination,
  });

  let currentDelivery = await createDeliveryActivity({
    ...input,
    routeDurationSeconds,
  });

  const completeDelivery = async () => {
    await updateDeliveryStatusActivity({
      id: currentDelivery.id,
      status: 'DELIVERED',
      notified: currentDelivery.notified,
    });
    currentDelivery.status = 'DELIVERED';
    isDelivered = true;
  };

  setHandler(updateLocationSignal, async (newLocation: string) => {
    updateCount += 1;
    const { routeDurationSeconds } = await calculateRouteActivity({
      origin: newLocation,
      destination: currentDelivery.destination,
    });

    currentDelivery = await updateDeliveryLocationActivity({
      id: currentDelivery.id,
      location: newLocation,
      routeDurationSeconds,
    });

    if (routeDurationSeconds <= AUTO_DELIVER_SECONDS) {
      await completeDelivery();
      return;
    }
    const thresholdSecs = input.notifyThresholdSecs;
    const newEtaEpochSecs = Math.floor(Date.now() / 1000) + routeDurationSeconds;
    const delaySecs = newEtaEpochSecs - currentDelivery.originalEtaEpochSecs;
    if (delaySecs > thresholdSecs) {
      if (!currentDelivery.notified && currentDelivery.status !== 'DELIVERED') {
        const message = await generateDelayMessageActivity({
          minutes: Math.round(delaySecs / 60),
          origin: currentDelivery.origin,
          destination: currentDelivery.destination,
        });

        await notifyDelayActivity({
          id: currentDelivery.id,
          contactPhone: currentDelivery.contactPhone,
          message,
        });

        await updateDeliveryStatusActivity({
          id: currentDelivery.id,
          status: 'DELAYED',
          notified: true,
        });
        currentDelivery.status = 'DELAYED';
        currentDelivery.notified = true;
      }
    }

    // Rotate run after many updates to keep workflow history small
    if (updateCount >= MAX_LOOPS_BEFORE_CAN) {
      await continueAsNew<typeof deliveryLifecycleWorkflow>(input);
    }
  });

  setHandler(markDeliveredSignal, async () => {
    if (!isDelivered) {
      await completeDelivery();
    }
  });

  setHandler(getDeliveryQuery, () => currentDelivery);

  await condition(() => isDelivered);
}
