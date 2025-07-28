import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
} from '@temporalio/workflow';
import type { CreateDeliveryInput, Delivery } from '@typings';

const { createDeliveryActivity, calculateRouteActivity, updateDeliveryLocationActivity, notifyDelayActivity } =
  proxyActivities<{
    createDeliveryActivity: typeof import('../activities/createDeliveryActivity').createDeliveryActivity;
    calculateRouteActivity: typeof import('../activities/calculateRouteActivity').calculateRouteActivity;
    updateDeliveryLocationActivity: typeof import('../activities/updateDeliveryLocationActivity').updateDeliveryLocationActivity;
    notifyDelayActivity: typeof import('../activities/notifyDelayActivity').notifyDelayActivity;
  }>({ startToCloseTimeout: '1 minute' });

// ---------- Signals & Queries ----------
export const updateLocationSignal = defineSignal<[string]>('updateLocation');
export const getDeliveryQuery = defineQuery<Delivery>('getDelivery');

interface DeliveryLifecycleInput extends CreateDeliveryInput {
  id: string;
  notifyThresholdSecs: number;
}

export async function deliveryLifecycleWorkflow(input: DeliveryLifecycleInput): Promise<void> {
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

  // 2. Signal handler
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

    // c) Delay detection
    const thresholdSecs = input.notifyThresholdSecs;
    const newEtaEpochSecs = Math.floor(Date.now() / 1000) + routeDurationSeconds;
    const delaySecs = newEtaEpochSecs - currentDelivery.originalEtaEpochSecs;
    if (delaySecs > thresholdSecs) {
      await notifyDelayActivity({
        id: currentDelivery.id,
        delaySecs,
        delivery: {
          origin: currentDelivery.origin,
          destination: currentDelivery.destination,
          contactPhone: currentDelivery.contactPhone,
          name: currentDelivery.name,
        },
      });
    }
  });

  // 3. Query handler
  setHandler(getDeliveryQuery, () => currentDelivery);

  // 4. Park forever (until future complete signal is added)
  await condition(() => false);
}
