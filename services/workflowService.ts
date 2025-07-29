import { getTemporalClient } from '@temporalClient';
import { deliveryLifecycleWorkflow } from '@workflows/deliveryLifecycleWorkflow';

import { randomUUID } from 'crypto';
import type { CreateDeliveryRequest } from '@typings';

export class WorkflowService {
  /**
   * Create a new delivery via Temporal workflow
   */
  async createDelivery(input: CreateDeliveryRequest): Promise<{ workflowId: string }> {
    try {
      const client = await getTemporalClient();

      const thresholdSecs = Number(process.env.NOTIFY_THRESHOLD_SECONDS ?? '1800');
      const id = randomUUID();

      await client.workflow.start(deliveryLifecycleWorkflow, {
        args: [{ id, ...input, notifyThresholdSecs: thresholdSecs }],
        workflowId: id,
        taskQueue: 'FREIGHT_DELAY_Q',
      });

      return { workflowId: id };
    } catch (error) {
      console.error('Error starting delivery workflow:', error);
      throw new Error('Failed to start delivery workflow');
    }
  }

  /**
   * Emit markDelivered signal to running workflow
   */
  async markDelivered(id: string): Promise<void> {
    try {
      const client = await getTemporalClient();
      const handle = client.workflow.getHandle(id);
      await handle.signal('markDelivered');
    } catch (error) {
      console.error('Error signalling delivery workflow:', error);
      throw new Error('Failed to mark delivery as delivered');
    }
  }
}

export const workflowService = new WorkflowService();
