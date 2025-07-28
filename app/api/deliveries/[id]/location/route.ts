import { NextResponse } from 'next/server';
import { deliveryService } from '@services/deliveryService';
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

    const delivery = await deliveryService.updateDeliveryLocation(
      id.toString(),
      validatedData.location,
    );

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Convert Date objects to strings for JSON serialization
    const serializedDelivery = {
      ...delivery,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
    };
    return NextResponse.json({ success: true, delivery: serializedDelivery });
  } catch (error) {
    console.error('Error updating delivery location:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
