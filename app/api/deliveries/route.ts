import { CreateDeliveryRequestSchema } from '@schemas/delivery';
import { readJson } from '../../../shared/http';
import { deliveryService } from '@services/deliveryService';
import { workflowService } from '@services/workflowService';

export async function POST(req: Request) {
  try {
    const data = await readJson(req, CreateDeliveryRequestSchema);

    const { workflowId } = await workflowService.createDelivery(data);

    return Response.json({ success: true, workflowId });
  } catch (error) {
    console.error('Error creating delivery:', error);
    return Response.json({ error: 'Failed to create delivery' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const deliveries = await deliveryService.getAllDeliveries();
    // Convert Date objects to strings for JSON serialization
    const serializedDeliveries = deliveries.map((delivery) => ({
      ...delivery,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
    }));
    return Response.json({ success: true, deliveries: serializedDeliveries });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return Response.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}
