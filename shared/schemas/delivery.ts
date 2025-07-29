// shared/schemas/delivery.ts
import { z } from 'zod';
import { DeliveryStatus } from '@prisma/client';

export const CreateDeliverySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Name is required'),
  origin: z.string().min(10, 'Origin is required'),
  destination: z.string().min(10, 'Destination is required'),
  contactPhone: z
    .string()
    .transform((val) => val.replace(/[^\d+]/g, ''))
    .pipe(z.e164('Contact phone must be in E.164 format with country code (e.g., +1234567890)')),
  routeDurationSeconds: z.number().positive('Route duration must be a positive number of seconds'),
});

export const CreateDeliveryInputSchema = CreateDeliverySchema.omit({
  routeDurationSeconds: true,
});

export const CreateDeliveryRequestSchema = CreateDeliveryInputSchema.omit({
  id: true,
});

export const CreateDeliveryActivityOutputSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  contactPhone: z.string(),
  status: z.enum(DeliveryStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  originalEtaEpochSecs: z.number(),
  currentRouteDurationSeconds: z.number(),
  currentLocation: z.string(),
  notified: z.boolean(),
});
