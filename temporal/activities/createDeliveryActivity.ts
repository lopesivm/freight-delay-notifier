// temporal/activities/createDeliveryActivity.ts
import { CreateDeliverySchema, CreateDeliveryActivityOutputSchema } from '@schemas/delivery';
import type { CreateDeliveryInput, CreateDeliveryActivityOutput } from '@typings';
import { deliveryService } from '@services/deliveryService';

export interface CreateDeliveryActivityParams extends CreateDeliveryInput {
  id: string;
  routeDurationSeconds: number;
}

export async function createDeliveryActivity(
  input: CreateDeliveryActivityParams,
  service = deliveryService,
): Promise<CreateDeliveryActivityOutput> {
  const { id, name, origin, destination, contactPhone, routeDurationSeconds } =
    CreateDeliverySchema.parse(input);

  const originalEtaEpochSecs = Math.floor(Date.now() / 1000) + routeDurationSeconds;

  const delivery = await service.createDelivery({
    id,
    name,
    origin,
    destination,
    contactPhone,
    status: 'ON_ROUTE',
    originalEtaEpochSecs,
    currentRouteDurationSeconds: routeDurationSeconds,
  });

  return CreateDeliveryActivityOutputSchema.parse({
    ...delivery,
    originalEtaEpochSecs: delivery.originalEtaEpochSecs,
    currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    notified: delivery.notified,
  });
}
