import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { DeliveryStatus } from '@prisma/client';
import {
  deliveryLifecycleWorkflow,
  markDeliveredSignal,
  updateLocationSignal,
} from '../deliveryLifecycleWorkflow';
import { v4 as uuid } from 'uuid';

describe('deliveryLifecycleWorkflow (integration)', () => {
  const TASK_QUEUE = 'test-delivery-q';
  let env: TestWorkflowEnvironment;
  let worker: Worker;
  const mockCreateDelivery = vi.fn();
  const mockCalcRoute = vi.fn();
  const mockUpdateLocation = vi.fn();
  const mockNotifyDelay = vi.fn();
  const mockGenMsg = vi.fn();
  const mockUpdateStatus = vi.fn();

  beforeAll(async () => {
    env = await TestWorkflowEnvironment.createTimeSkipping();
    worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue: TASK_QUEUE,
      workflowsPath: require.resolve('../deliveryLifecycleWorkflow.ts'),
      activities: {
        createDeliveryActivity: mockCreateDelivery,
        calculateRouteActivity: mockCalcRoute,
        updateDeliveryLocationActivity: mockUpdateLocation,
        notifyDelayActivity: mockNotifyDelay,
        generateDelayMessageActivity: mockGenMsg,
        updateDeliveryStatusActivity: mockUpdateStatus,
      },
    });
    worker.run();
  });

  afterAll(async () => {
    await worker.shutdown();
    await env.teardown();
  });

  it('completes happy path with DELIVERED status', async () => {
    const id = uuid();
    const baseDelivery = {
      id,
      name: 'Test',
      origin: 'Origin City 12345',
      destination: 'Dest City 67890',
      contactPhone: '+15551234567',
      createdAt: new Date(),
      updatedAt: new Date(),
      originalEtaEpochSecs: Math.floor(Date.now() / 1000) + 3600,
      currentRouteDurationSeconds: 3600,
      currentLocation: 'Origin City 12345',
      status: DeliveryStatus.ON_ROUTE,
      notified: false,
    };

    mockCalcRoute.mockResolvedValue({ routeDurationSeconds: 3600 });
    mockCreateDelivery.mockResolvedValue(baseDelivery);
    mockUpdateLocation.mockImplementation(async ({ id: _id, location }) => {
      return { ...baseDelivery, currentLocation: location, currentRouteDurationSeconds: 0 };
    });
    mockUpdateStatus.mockResolvedValue(undefined);

    const client = env.workflowClient;
    const handle = await client.start(deliveryLifecycleWorkflow, {
      taskQueue: worker.options.taskQueue,
      workflowId: id,
      args: [
        {
          id,
          name: baseDelivery.name,
          origin: baseDelivery.origin,
          destination: baseDelivery.destination,
          contactPhone: baseDelivery.contactPhone,
          notifyThresholdSecs: 1800,
        },
      ],
    });

    await handle.signal(markDeliveredSignal);

    await handle.result();

    expect(mockCreateDelivery).toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith(expect.objectContaining({ status: 'DELIVERED' }));
  }, 10000);

  it('retries on injected activity failure and still succeeds', async () => {
    const id = uuid();

    let attempt = 0;
    mockCalcRoute.mockImplementation(async () => {
      attempt += 1;
      if (attempt === 1) {
        throw new Error('transient');
      }
      return { routeDurationSeconds: 60 };
    });
    mockCreateDelivery.mockResolvedValue({
      id,
      name: 'X',
      origin: 'O'.repeat(10),
      destination: 'D'.repeat(10),
      contactPhone: '+15555555555',
      createdAt: new Date(),
      updatedAt: new Date(),
      originalEtaEpochSecs: Math.floor(Date.now() / 1000) + 60,
      currentRouteDurationSeconds: 60,
      currentLocation: 'O'.repeat(10),
      status: DeliveryStatus.ON_ROUTE,
      notified: false,
    });
    mockUpdateStatus.mockResolvedValue(undefined);

    const client = env.workflowClient;
    const handle = await client.start(deliveryLifecycleWorkflow, {
      taskQueue: worker.options.taskQueue,
      workflowId: id,
      args: [
        {
          id,
          name: 'X',
          origin: 'O'.repeat(10),
          destination: 'D'.repeat(10),
          contactPhone: '+15555555555',
          notifyThresholdSecs: 1800,
        },
      ],
    });

    await handle.signal(updateLocationSignal, 'NewLoc 123456');
    await handle.signal(markDeliveredSignal);
    await handle.result();

    expect(attempt).toBeGreaterThan(1);
    expect(mockUpdateStatus).toHaveBeenCalledWith(expect.objectContaining({ status: 'DELIVERED' }));
  }, 10000);
});
