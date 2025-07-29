import { z } from 'zod';

export const CalculateRouteInputSchema = z.object({
  origin: z.string().min(1, 'Origin address is required'),
  destination: z.string().min(1, 'Destination address is required'),
});

export const CalculateRouteOutputSchema = z.object({
  routeDurationSeconds: z
    .number()
    .int()
    .positive('Route duration must be a positive number of seconds'),
});

export const GoogleRouteResponseSchema = z.object({
  routes: z
    .array(
      z.object({
        duration: z.string().regex(/^\d+s$/, 'Duration must be in format "123s"'),
      }),
    )
    .min(1, 'At least one route must be returned'),
});
