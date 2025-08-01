import { createDeliveryActivity } from '../createDeliveryActivity';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveryStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

// Mock the delivery service
const mockDeliveryService = {
  createDelivery: vi.fn(),
  getAllDeliveries: vi.fn(),
  getDeliveryById: vi.fn(),
  updateDeliveryLocation: vi.fn(),
  updateDeliveryStatus: vi.fn(),
};

const testId = randomUUID();
const altTestId = randomUUID();

// Base mock delivery from service (as returned by deliveryService)
const baseMockDelivery = {
  id: testId,
  name: 'Test Delivery',
  origin: 'New York City, NY 10001',
  destination: 'Los Angeles, CA 90210',
  contactPhone: '+15551234567',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  originalEtaEpochSecs: 1704067200,
  currentRouteDurationSeconds: 3600,
  status: DeliveryStatus.ON_ROUTE,
  notified: false,
  currentLocation: 'New York City, NY 10001',
};

// Expected output matches the schema exactly
const baseExpectedOutput = {
  id: testId,
  name: 'Test Delivery',
  origin: 'New York City, NY 10001',
  destination: 'Los Angeles, CA 90210',
  contactPhone: '+15551234567',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  status: DeliveryStatus.ON_ROUTE,
  originalEtaEpochSecs: 1704067200,
  currentRouteDurationSeconds: 3600,
  currentLocation: 'New York City, NY 10001',
};

// Base valid input object
const baseValidInput = {
  id: testId,
  name: 'Test Delivery',
  origin: 'New York City, NY 10001',
  destination: 'Los Angeles, CA 90210',
  contactPhone: '+15551234567',
  routeDurationSeconds: 3600,
};

describe('createDeliveryActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a delivery with valid input', async () => {
    mockDeliveryService.createDelivery.mockResolvedValue(baseMockDelivery);

    const input = baseValidInput;

    const result = await createDeliveryActivity(input, mockDeliveryService);

    expect(mockDeliveryService.createDelivery).toHaveBeenCalledWith({
      id: testId,
      name: 'Test Delivery',
      origin: 'New York City, NY 10001',
      destination: 'Los Angeles, CA 90210',
      contactPhone: '+15551234567',
      status: DeliveryStatus.ON_ROUTE,
      originalEtaEpochSecs: expect.any(Number),
      currentRouteDurationSeconds: 3600,
    });

    expect(result).toEqual({ ...baseExpectedOutput, notified: false });
  });

  it('should handle missing required fields', async () => {
    const input = {
      ...baseValidInput,
      name: '',
    };

    await expect(createDeliveryActivity(input, mockDeliveryService)).rejects.toThrow();
    expect(mockDeliveryService.createDelivery).not.toHaveBeenCalled();
  });

  it('should create delivery with correct ETA values', async () => {
    const mockDelivery = {
      ...baseMockDelivery,
      id: altTestId,
    };
    mockDeliveryService.createDelivery.mockResolvedValue(mockDelivery);

    await createDeliveryActivity(baseValidInput, mockDeliveryService);

    expect(mockDeliveryService.createDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        id: testId,
        originalEtaEpochSecs: expect.any(Number),
        currentRouteDurationSeconds: 3600,
      }),
    );
  });

  it('should handle service errors gracefully', async () => {
    mockDeliveryService.createDelivery.mockRejectedValue(new Error('Service unavailable'));

    await expect(createDeliveryActivity(baseValidInput, mockDeliveryService)).rejects.toThrow(
      'Service unavailable',
    );
    expect(mockDeliveryService.createDelivery).toHaveBeenCalled();
  });

  it('should validate input types correctly', async () => {
    const invalidInput = {
      ...baseValidInput,
      routeDurationSeconds: 'invalid',
    } as any;

    await expect(createDeliveryActivity(invalidInput, mockDeliveryService)).rejects.toThrow();
    expect(mockDeliveryService.createDelivery).not.toHaveBeenCalled();
  });
});
