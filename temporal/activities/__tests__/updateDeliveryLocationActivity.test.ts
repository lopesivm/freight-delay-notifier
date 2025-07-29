import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { updateDeliveryLocationActivity } from '../updateDeliveryLocationActivity';
import type { Delivery } from '@typings';
import { DeliveryStatus } from '@prisma/client';

const id = randomUUID();

// Helper to build a delivery object
function buildDelivery(partial: Partial<Delivery> = {}): Delivery {
  return {
    id,
    name: 'Test Package',
    origin: 'New York, NY',
    destination: 'Boston, MA',
    contactPhone: '+15555555555',
    status: DeliveryStatus.ON_ROUTE,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    originalEtaEpochSecs: 1_705_000_000,
    currentRouteDurationSeconds: 3_600,
    currentLocation: 'New York, NY',
    notified: false,
    ...partial,
  };
}

describe('updateDeliveryLocationActivity', () => {
  const mockService = {
    updateDeliveryLocation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update delivery location successfully', async () => {
    const input = {
      id,
      location: 'Hartford, CT',
      routeDurationSeconds: 1_800,
    };

    const mockDelivery = buildDelivery({
      currentLocation: input.location,
      currentRouteDurationSeconds: input.routeDurationSeconds,
    });

    mockService.updateDeliveryLocation.mockResolvedValue(mockDelivery);

    const result = await updateDeliveryLocationActivity(input, mockService as any);

    expect(result).toEqual(mockDelivery);
    expect(mockService.updateDeliveryLocation).toHaveBeenCalledWith(
      input.id,
      input.location,
      input.routeDurationSeconds,
    );
  });

  it('should validate input using Zod (invalid location)', async () => {
    const invalidInput = {
      id,
      location: 'short',
      routeDurationSeconds: 1_800,
    };

    await expect(
      updateDeliveryLocationActivity(invalidInput as any, mockService as any),
    ).rejects.toThrow();
    expect(mockService.updateDeliveryLocation).not.toHaveBeenCalled();
  });

  it('should propagate service errors', async () => {
    const input = {
      id,
      location: 'Hartford, CT',
      routeDurationSeconds: 1_800,
    };

    mockService.updateDeliveryLocation.mockRejectedValue(new Error('DB error'));

    await expect(updateDeliveryLocationActivity(input, mockService as any)).rejects.toThrow(
      'DB error',
    );
  });
});
