// temporal/activities/createDeliveryActivity.ts
import { CreateDeliverySchema, CreateDeliveryActivityOutputSchema } from '@schemas/delivery';
import type { CreateDeliveryInput, CreateDeliveryActivityOutput } from '@/shared/types';
import { deliveryService } from '@services/deliveryService';

export interface CreateDeliveryActivityParams extends CreateDeliveryInput {
  routeDurationSeconds: number;
}

export async function createDeliveryActivity(
  input: CreateDeliveryActivityParams,
  service = deliveryService,
): Promise<CreateDeliveryActivityOutput> {
  const { name, origin, destination, contactPhone, routeDurationSeconds } =
    CreateDeliverySchema.parse(input);

  const originalEtaEpochSecs = Math.floor(Date.now() / 1000) + routeDurationSeconds;

  const delivery = await service.createDelivery({
    name,
    origin,
    destination,
    contactPhone,
    status: 'ON_ROUTE',
    originalEtaEpochSecs,
    currentRouteDurationSeconds: routeDurationSeconds,
  });

  // Convert to the expected output format
  return CreateDeliveryActivityOutputSchema.parse({
    ...delivery,
    originalEtaEpochSecs: delivery.originalEtaEpochSecs,
    currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
  });
}
