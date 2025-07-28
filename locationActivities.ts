// import prisma from '@db';

// /**
//  * Location-specific activities for handling GPS updates and location management
//  */

// export interface LocationActivities {
//   updateDeliveryLocation(id: string, location: string): Promise<void>;
//   getDeliveryLocation(id: string): Promise<string | null>;
// }

// export async function updateDeliveryLocation(id: string, location: string): Promise<void> {
//   await prisma.delivery.update({
//     where: { id },
//     data: { lastLocation: location },
//   });
// }

// export async function getDeliveryLocation(id: string): Promise<string | null> {
//   const delivery = await prisma.delivery.findUnique({
//     where: { id },
//     select: { lastLocation: true },
//   });

//   return delivery?.lastLocation || null;
// }
