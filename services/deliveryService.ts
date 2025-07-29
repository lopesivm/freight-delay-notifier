import prisma from '@db';
import type { Delivery } from '@typings';
import { DeliveryStatus } from '@prisma/client';

export class DeliveryService {
  /**
   * Get all deliveries from the database
   */
  async getAllDeliveries(): Promise<Delivery[]> {
    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Convert BigInt fields to numbers
    return deliveries.map((delivery) => ({
      ...delivery,
      originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
      currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    }));
  }

  /**
   * Get a single delivery by ID
   */
  async getDeliveryById(id: string): Promise<Delivery | null> {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return null;
    }

    return {
      ...delivery,
      originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
      currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    };
  }

  /**
   * Create a new delivery
   */
  async createDelivery(data: {
    id?: string;
    name: string;
    origin: string;
    destination: string;
    contactPhone: string;
    originalEtaEpochSecs: number;
    currentRouteDurationSeconds: number;
    status: DeliveryStatus;
  }): Promise<Delivery> {
    const delivery = await prisma.delivery.create({
      data: {
        id: data.id,
        name: data.name,
        origin: data.origin,
        destination: data.destination,
        contactPhone: data.contactPhone,
        status: data.status,
        originalEtaEpochSecs: BigInt(data.originalEtaEpochSecs),
        currentRouteDurationSeconds: data.currentRouteDurationSeconds,
        currentLocation: data.origin,
      },
    });

    return {
      ...delivery,
      originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
      currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    };
  }

  /**
   * Update delivery location and ETA
   */
  /**
   * Update delivery status / notified flag
   */
  async updateDeliveryStatus(
    id: string,
    status: DeliveryStatus,
    notified?: boolean,
  ): Promise<Delivery> {
    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        ...(typeof notified === 'boolean' ? { notified } : {}),
      },
    });

    return {
      ...delivery,
      originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
      currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    };
  }

  async updateDeliveryLocation(
    id: string,
    currentLocation: string,
    currentRouteDurationSeconds?: number,
  ): Promise<Delivery> {
    const updateData: Record<string, unknown> = { currentLocation };
    if (typeof currentRouteDurationSeconds === 'number') {
      updateData.currentRouteDurationSeconds = currentRouteDurationSeconds;
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
    });

    return {
      ...delivery,
      originalEtaEpochSecs: Number(delivery.originalEtaEpochSecs),
      currentRouteDurationSeconds: delivery.currentRouteDurationSeconds,
    };
  }
}

export const deliveryService = new DeliveryService();
