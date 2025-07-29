import { z } from 'zod';

export async function readJson<T>(req: Request, schema: z.Schema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Response(
      JSON.stringify({ error: 'Invalid input data', details: result.error.issues }),
      { status: 400 },
    );
  }
  return result.data;
}
