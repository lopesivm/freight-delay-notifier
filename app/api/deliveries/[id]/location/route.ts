import { NextResponse } from 'next/server';
import { getTemporalClient } from '@temporalClient';
import { updateLocationSignal } from '@workflows/deliveryLifecycleWorkflow';
import { z } from 'zod';

const UpdateLocationSchema = z.object({
  location: z.string().min(1),
});
0;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdateLocationSchema.parse(body);

    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(id.toString());
    await handle.signal(updateLocationSignal, validatedData.location);
    console.log('[PATCH] Signal sent');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating delivery location:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
