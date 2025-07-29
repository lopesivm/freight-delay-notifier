import { workflowService } from '@services/workflowService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return Response.json({ error: 'Delivery id is required' }, { status: 400 });
  }
  try {
    await workflowService.markDelivered(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Failed to mark delivery as delivered', err);
    return Response.json({ error: 'Failed to mark delivered' }, { status: 500 });
  }
}
