import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCalc, mockCreate } = vi.hoisted(() => ({
  mockCalc: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock('@temporalio/workflow', () => ({
  proxyActivities: () => ({
    calculateRouteActivity: mockCalc,
    createDeliveryActivity: mockCreate,
  }),
}));

// Import after mocking
import { createDeliveryWorkflow } from '../createDeliveryWorkflow';

describe('createDeliveryWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should orchestrate route calculation and delivery creation', async () => {
    const mockNow = 1703980800000;
    vi.setSystemTime(mockNow);

    const input = {
      name: 'Test Delivery',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      contactPhone: '+15551234567',
    };

    const routeResult = {
      routeDurationSeconds: 3600, // 1 hour duration in seconds
    };

    const deliveryResult = {
      id: 'test-id',
      name: 'Test Delivery',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      contactPhone: '+15551234567',
      createdAt: new Date(mockNow),
      updatedAt: new Date(mockNow),
      status: 'ON_ROUTE',
      originalEtaEpochSecs: BigInt(Math.floor(mockNow / 1000) + routeResult.routeDurationSeconds),
      currentRouteDurationSeconds: routeResult.routeDurationSeconds,
      notified: false,
    };

    mockCalc.mockResolvedValue(routeResult);
    mockCreate.mockResolvedValue(deliveryResult);

    const result = await createDeliveryWorkflow(input);

    expect(mockCalc).toHaveBeenCalledWith({
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      ...input,
      routeDurationSeconds: routeResult.routeDurationSeconds,
    });

    expect(result).toEqual(deliveryResult);
  });

  it('should handle route calculation failures', async () => {
    const input = {
      name: 'Test Delivery',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      contactPhone: '+15551234567',
    };

    mockCalc.mockRejectedValue(new Error('Google Maps API error'));

    await expect(createDeliveryWorkflow(input)).rejects.toThrow('Google Maps API error');

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
