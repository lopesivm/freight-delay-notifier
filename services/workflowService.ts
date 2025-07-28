import { getTemporalClient } from '@temporalClient';
import { createDeliveryWorkflow } from '@workflows/createDeliveryWorkflow';

import type { Delivery, CreateDeliveryInput } from '@typings';

export class WorkflowService {
  /**
   * Create a new delivery via Temporal workflow
   */
  async createDelivery(input: CreateDeliveryInput): Promise<{
    delivery: Delivery;
    workflowId: string;
  }> {
    try {
      const client = await getTemporalClient();

      const handle = await client.workflow.start(createDeliveryWorkflow, {
        args: [input],
        workflowId: `delivery-${Date.now()}`,
        taskQueue: 'FREIGHT_DELAY_Q',
      });

      const delivery = await handle.result();

      const convertedDelivery: Delivery = {
        ...delivery,
        originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
        currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
        createdAt: new Date(delivery.createdAt),
        updatedAt: new Date(delivery.updatedAt),
      };

      return {
        delivery: convertedDelivery,
        workflowId: handle.workflowId,
      };
    } catch (error) {
      console.error('Error in createDelivery workflow:', error);
      throw new Error('Failed to create delivery via workflow');
    }
  }
}

export const workflowService = new WorkflowService();
