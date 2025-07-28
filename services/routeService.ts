import { CalculateRouteInputSchema, GoogleRouteResponseSchema } from '@schemas/route';
import type { CalculateRouteInput, CalculateRouteOutput } from '@typings';

const GMAPS_KEY = process.env.GMAPS_KEY;

if (!GMAPS_KEY) {
  throw new Error('GMAPS_KEY environment variable is required');
}

// Ensure GMAPS_KEY is non-undefined for TypeScript
const apiKey: string = GMAPS_KEY;

export async function getRouteDuration(input: CalculateRouteInput): Promise<CalculateRouteOutput> {
  // Validate input
  const validatedInput = CalculateRouteInputSchema.parse(input);

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.duration',
    },
    body: JSON.stringify({
      origin: { address: validatedInput.origin },
      destination: { address: validatedInput.destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Routes API failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  // Validate response
  const validatedResponse = GoogleRouteResponseSchema.parse(json);

  const durationStr = validatedResponse.routes[0].duration;
  const routeDurationSeconds = parseInt(durationStr.replace('s', ''), 10);

  return {
    routeDurationSeconds,
  };
}
