import { z } from 'zod';

export const UpdateLocationSignalSchema = z.object({
  id: z.uuid(),
  location: z.string().min(10, 'Location is required'),
  routeDurationSeconds: z.number().positive(),
});
