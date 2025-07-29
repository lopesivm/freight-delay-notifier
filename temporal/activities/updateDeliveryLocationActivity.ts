import { deliveryService } from '@services/deliveryService';
import type { Delivery, UpdateLocationSignalInput } from '@typings';
import { UpdateLocationSignalSchema } from '@schemas/updateLocation';

export async function updateDeliveryLocationActivity(
  input: UpdateLocationSignalInput,
  service = deliveryService,
): Promise<Delivery> {
  const { id, location, routeDurationSeconds } = UpdateLocationSignalSchema.parse(input);

  const delivery = await service.updateDeliveryLocation(id, location, routeDurationSeconds);

  return delivery;
}
