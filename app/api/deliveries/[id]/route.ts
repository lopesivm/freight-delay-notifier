import { NextResponse } from 'next/server';
import { deliveryService } from '@services/deliveryService';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const delivery = await deliveryService.getDeliveryById(params.id);
  if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(delivery);
}
