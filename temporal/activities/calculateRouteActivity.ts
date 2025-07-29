import { CalculateRouteInputSchema, CalculateRouteOutputSchema } from '@schemas/route';
import { getRouteDuration } from '@services/routeService';
import type { z } from 'zod';

type CalculateRouteInput = z.infer<typeof CalculateRouteInputSchema>;
type CalculateRouteOutput = z.infer<typeof CalculateRouteOutputSchema>;

export async function calculateRouteActivity(
  input: CalculateRouteInput,
  routeDurationFn: typeof getRouteDuration = getRouteDuration,
): Promise<CalculateRouteOutput> {
  const validatedInput = CalculateRouteInputSchema.parse(input);
  const routeResult = await routeDurationFn(validatedInput);

  return CalculateRouteOutputSchema.parse(routeResult);
}
