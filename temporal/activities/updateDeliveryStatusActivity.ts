import { ApplicationFailure } from '@temporalio/common';
import { DeliveryStatus } from '@prisma/client';
import { deliveryService } from '@services/deliveryService';

export interface UpdateDeliveryStatusActivityInput {
  id: string;
  status: DeliveryStatus;
  notified?: boolean;
}

export async function updateDeliveryStatusActivity(
  { id, status, notified }: UpdateDeliveryStatusActivityInput,
  service = deliveryService,
) {
  try {
    await service.updateDeliveryStatus(id, status, notified);
  } catch (err: any) {
    throw ApplicationFailure.nonRetryable(`Failed to update delivery status: ${err.message}`);
  }
}
