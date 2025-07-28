import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateRouteActivity } from '../calculateRouteActivity';
import { getRouteDuration } from '@/services/routeService';

// Mock the route service
vi.mock('@/services/routeService', () => ({
  getRouteDuration: vi.fn(),
}));

describe('calculateRouteActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate route duration successfully', async () => {
    const mockNow = 1703980800000;
    vi.setSystemTime(mockNow);

    vi.mocked(getRouteDuration).mockResolvedValue({
      routeDurationSeconds: 3600, // 1 hour from now in seconds
    });

    const input = {
      origin: 'New York, NY',
      destination: 'Boston, MA',
    };

    const result = await calculateRouteActivity(input);

    expect(result).toEqual({
      routeDurationSeconds: 3600,
    });

    expect(getRouteDuration).toHaveBeenCalledWith({
      origin: 'New York, NY',
      destination: 'Boston, MA',
    });
  });

  it('should validate input with Zod', async () => {
    const invalidInput = {
      origin: '', // empty string should fail validation
      destination: 'Boston, MA',
    };

    await expect(calculateRouteActivity(invalidInput)).rejects.toThrow();
    expect(getRouteDuration).not.toHaveBeenCalled();
  });

  it('should validate output with Zod', async () => {
    vi.mocked(getRouteDuration).mockResolvedValue({
      routeDurationSeconds: -1, // negative should fail validation
    });

    const input = {
      origin: 'New York, NY',
      destination: 'Boston, MA',
    };

    await expect(calculateRouteActivity(input)).rejects.toThrow();
  });

  it('should handle service errors gracefully', async () => {
    vi.mocked(getRouteDuration).mockRejectedValue(new Error('Google Maps API error'));

    const input = {
      origin: 'New York, NY',
      destination: 'Boston, MA',
    };

    await expect(calculateRouteActivity(input)).rejects.toThrow('Google Maps API error');
  });
});
