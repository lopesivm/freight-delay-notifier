import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
} from '@temporalio/workflow';
import type { CreateDeliveryInput, Delivery } from '@typings';

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
}>({ startToCloseTimeout: '1 minute' });

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
  // 1. Persist delivery
  // 1a. Calculate route duration
  const { routeDurationSeconds } = await calculateRouteActivity({
    origin: input.origin,
    destination: input.destination,
  });

  // 1b. Persist delivery with calculated ETA
  let currentDelivery = await createDeliveryActivity({
    ...input,
    routeDurationSeconds,
  });

  // Helper to mark delivery as delivered and persist status
  const completeDelivery = async () => {
    await updateDeliveryStatusActivity({
      id: currentDelivery.id,
      status: 'DELIVERED',
      notified: currentDelivery.notified,
    });
    currentDelivery.status = 'DELIVERED';
    isDelivered = true;
  };

  // 2. Signal handlers
  setHandler(updateLocationSignal, async (newLocation: string) => {
    // a) Recalculate route duration
    const { routeDurationSeconds } = await calculateRouteActivity({
      origin: newLocation,
      destination: currentDelivery.destination,
    });

    // b) Update DB + local state
    currentDelivery = await updateDeliveryLocationActivity({
      id: currentDelivery.id,
      location: newLocation,
      routeDurationSeconds,
    });

    // c) Delivery completion detection
    if (routeDurationSeconds <= 30) {
      await completeDelivery();
      return;
    }

    // d) Delay detection
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

        // Persist that the delivery has been notified and is delayed
        await updateDeliveryStatusActivity({
          id: currentDelivery.id,
          status: 'DELAYED',
          notified: true,
        });
        currentDelivery.status = 'DELAYED';
        currentDelivery.notified = true;
      }
    }
  });

  // b) explicit delivered signal
  setHandler(markDeliveredSignal, async () => {
    if (!isDelivered) {
      await completeDelivery();
    }
  });

  // 3. Query handler
  setHandler(getDeliveryQuery, () => currentDelivery);

  // 4. Wait until delivered
  await condition(() => isDelivered);
}
