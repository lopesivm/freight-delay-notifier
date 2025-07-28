import { getTemporalClient } from '@temporalClient';
import { deliveryLifecycleWorkflow } from '@workflows/deliveryLifecycleWorkflow';

import type { CreateDeliveryInput } from '@typings';

export class WorkflowService {
  /**
   * Create a new delivery via Temporal workflow
   */
  async createDelivery(input: CreateDeliveryInput): Promise<{ workflowId: string }> {
    try {
      const client = await getTemporalClient();

      const { randomUUID } = await import('crypto');
      const deliveryId = randomUUID();

      const thresholdSecs = Number(process.env.NOTIFY_THRESHOLD_SECONDS ?? '1800');

      await client.workflow.start(deliveryLifecycleWorkflow, {
        args: [{ ...input, id: deliveryId, notifyThresholdSecs: thresholdSecs }],
        workflowId: deliveryId,
        taskQueue: 'FREIGHT_DELAY_Q',
      });

      return { workflowId: deliveryId };
    } catch (error) {
      console.error('Error starting delivery workflow:', error);
      throw new Error('Failed to start delivery workflow');
    }
  }
}

export const workflowService = new WorkflowService();
