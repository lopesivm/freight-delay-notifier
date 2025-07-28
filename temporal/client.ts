import { Connection, Client } from '@temporalio/client';

let clientPromise: Promise<Client> | null = null;

export async function getTemporalClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connection = await Connection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
      });
      return new Client({ connection });
    })();
  }
  return clientPromise;
}
