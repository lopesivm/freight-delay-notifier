import { deliveryService } from '@services/deliveryService';
import type { Delivery, UpdateLocationSignalInput } from '@typings';
import { UpdateLocationSignalSchema } from '@schemas/updateLocation';

export async function updateDeliveryLocationActivity(
  input: UpdateLocationSignalInput,
): Promise<Delivery> {
  const { id, location, routeDurationSeconds } = UpdateLocationSignalSchema.parse(input);

  const delivery = await deliveryService.updateDeliveryLocation(id, location, routeDurationSeconds);

  return delivery;
}
