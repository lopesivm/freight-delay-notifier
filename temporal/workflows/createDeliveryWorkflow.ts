import { proxyActivities } from '@temporalio/workflow';
import type {
  CreateDeliveryInput,
  CreateDeliveryActivityOutput,
  CalculateRouteOutput,
} from '@typings';

const { createDeliveryActivity, calculateRouteActivity } = proxyActivities({
  startToCloseTimeout: '30 seconds',
});

export async function createDeliveryWorkflow(
  input: CreateDeliveryInput,
): Promise<CreateDeliveryActivityOutput> {
  // Step 1: Calculate route duration using Google Maps API
  const routeResult: CalculateRouteOutput = await calculateRouteActivity({
    origin: input.origin,
    destination: input.destination,
  });

  // Step 2: Create delivery with calculated ETA
  return await createDeliveryActivity({
    ...input,
    routeDurationSeconds: routeResult.routeDurationSeconds,
  });
}
