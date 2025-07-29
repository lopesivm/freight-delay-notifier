import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

const { mockHandle, mockClient } = vi.hoisted(() => {
  const mockHandle = {
    signal: vi.fn(),
  };
  const mockClient = {
    workflow: {
      getHandle: vi.fn().mockReturnValue(mockHandle),
    },
  };
  return { mockHandle, mockClient } as const;
});

vi.mock('@temporalClient', () => ({
  getTemporalClient: async () => mockClient,
}));

import * as locationRoute from '../route';
import { updateLocationSignal } from '@workflows/deliveryLifecycleWorkflow';

const id = randomUUID();

const makeRequest = (body: unknown) =>
  new Request(`http://localhost/api/deliveries/${id}/location`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('PATCH /api/deliveries/:id/location', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success and calls Temporal signal', async () => {
    const location = 'New Location City 12345';
    const req = makeRequest({ location });

    const res = await locationRoute.PATCH(req, { params: { id } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(mockClient.workflow.getHandle).toHaveBeenCalledWith(id);
    expect(mockHandle.signal).toHaveBeenCalledWith(updateLocationSignal, location);
  });

  it('returns 404 when workflow not found', async () => {
    const err = new Error('not found');
    // @ts-ignore
    err.name = 'WorkflowNotFoundError';
    mockClient.workflow.getHandle.mockImplementationOnce(() => {
      throw err;
    });

    const res = await locationRoute.PATCH(makeRequest({ location: 'Another Place 12345' }), {
      params: { id },
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Delivery not found');
  });
});
