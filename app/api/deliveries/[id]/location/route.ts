import { NextResponse } from 'next/server';
import { getTemporalClient } from '@temporalClient';
import { updateLocationSignal } from '@workflows/deliveryLifecycleWorkflow';
import { z } from 'zod';
import { readJson } from '@shared/http';

const UpdateLocationSchema = z.object({
  location: z.string().min(10),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { location } = await readJson(req, UpdateLocationSchema);

    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(params.id);
    await handle.signal(updateLocationSignal, location);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error; // handled validation
    if (error instanceof Error && error.name === 'WorkflowNotFoundError') {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    console.error('Error updating delivery location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
