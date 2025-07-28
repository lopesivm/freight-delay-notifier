import type {
  CreateDeliveryActivityOutputSchema,
  CreateDeliveryInputSchema,
} from '@schemas/delivery';
import { z } from 'zod';
import { DeliveryStatus } from '@prisma/client';
import { CalculateRouteInputSchema, CalculateRouteOutputSchema } from '@schemas/route';
import { UpdateLocationSignalSchema } from '@schemas/updateLocation';

export interface Delivery {
  id: string;
  name: string;
  origin: string;
  destination: string;
  contactPhone: string;
  status: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
  originalEtaEpochSecs: number;
  currentRouteDurationSeconds: number;
  currentLocation: string;
}

export interface UpdateLocationInput {
  location: string;
}

// Zod inference types
export type CreateDeliveryInput = z.infer<typeof CreateDeliveryInputSchema>;

export type CreateDeliveryActivityOutput = z.infer<typeof CreateDeliveryActivityOutputSchema>;

export type CalculateRouteInput = z.infer<typeof CalculateRouteInputSchema>;

export type CalculateRouteOutput = z.infer<typeof CalculateRouteOutputSchema>;

export type UpdateLocationSignalInput = z.infer<typeof UpdateLocationSignalSchema>;
