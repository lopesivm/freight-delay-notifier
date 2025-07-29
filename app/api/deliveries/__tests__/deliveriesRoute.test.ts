import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const { mockDeliveryService, mockWorkflowService } = vi.hoisted(() => {
  return {
    mockDeliveryService: {
      getAllDeliveries: vi.fn(),
    },
    mockWorkflowService: {
      createDelivery: vi.fn(),
    },
  } as const;
});

vi.mock('@services/deliveryService', () => ({
  deliveryService: mockDeliveryService,
}));
vi.mock('@services/workflowService', () => ({
  workflowService: mockWorkflowService,
}));

import * as deliveriesRoute from '../route';

describe('/api/deliveries route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a list of deliveries on success', async () => {
      // Arrange
      const now = new Date('2025-01-01T00:00:00.000Z');
      const mockDelivery = {
        id: randomUUID(),
        name: 'Test',
        origin: 'Origin City',
        destination: 'Destination City',
        contactPhone: '+15551234567',
        createdAt: now,
        updatedAt: now,
        originalEtaEpochSecs: 1704067200,
        currentRouteDurationSeconds: 3600,
        status: DeliveryStatus.ON_ROUTE,
        currentLocation: 'Origin City',
        notified: false,
      };
      mockDeliveryService.getAllDeliveries.mockResolvedValue([mockDelivery]);

      // Act
      const res = await deliveriesRoute.GET();
      const json = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.deliveries).toHaveLength(1);
      expect(json.deliveries[0]).toMatchObject({
        id: mockDelivery.id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      expect(mockDeliveryService.getAllDeliveries).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if the service throws', async () => {
      mockDeliveryService.getAllDeliveries.mockRejectedValue(new Error('DB down'));

      const res = await deliveriesRoute.GET();
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Failed to fetch deliveries');
    });
  });

  describe('POST', () => {
    const baseInput = {
      name: 'New Delivery',
      origin: 'Origin City 12345',
      destination: 'Destination City 67890',
      contactPhone: '+15551234567',
    };

    const makeRequest = (body: unknown) =>
      new Request('http://localhost/api/deliveries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

    it('should trigger workflow and return workflowId on success', async () => {
      mockWorkflowService.createDelivery.mockResolvedValue({ workflowId: 'abc123' });
      const req = makeRequest(baseInput);

      const res = await deliveriesRoute.POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true, workflowId: 'abc123' });
      expect(mockWorkflowService.createDelivery).toHaveBeenCalledWith(baseInput);
    });

    it('should return 500 if workflow service fails', async () => {
      mockWorkflowService.createDelivery.mockRejectedValue(new Error('Temporal down'));
      const req = makeRequest(baseInput);

      const res = await deliveriesRoute.POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Failed to create delivery');
    });
  });
});
