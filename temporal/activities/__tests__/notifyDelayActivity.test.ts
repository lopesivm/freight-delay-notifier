import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { notifyDelayActivity } from '../notifyDelayActivity';
import { ApplicationFailure } from '@temporalio/common';

const id = randomUUID();
const contactPhone = '+15555555555';
const message = 'Your delivery is delayed by 2 hours.';

describe('notifyDelayActivity', () => {
  const mockClient = {
    messages: {
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send SMS via Twilio', async () => {
    mockClient.messages.create.mockResolvedValue({ sid: 'SM123' });

    await expect(
      notifyDelayActivity({ id, contactPhone, message }, mockClient as any),
    ).resolves.not.toThrow();

    expect(mockClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: message,
        to: contactPhone,
      }),
    );
  });

  it('should throw non-retryable if client is missing', async () => {
    await expect(
      notifyDelayActivity({ id, contactPhone, message }, null as any),
    ).rejects.toBeInstanceOf(ApplicationFailure);
  });

  it('should propagate Twilio errors', async () => {
    mockClient.messages.create.mockRejectedValue(new Error('Twilio outage'));

    await expect(
      notifyDelayActivity({ id, contactPhone, message }, mockClient as any),
    ).rejects.toThrow('Twilio outage');
  });
});
