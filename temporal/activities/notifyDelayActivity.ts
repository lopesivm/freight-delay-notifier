import crypto from 'crypto';
import { ApplicationFailure } from '@temporalio/common';
import type { Delivery } from '@typings';

export interface NotifyDelayActivityInput {
  id: string;
  delaySecs: number;
  delivery: Pick<Delivery, 'origin' | 'destination' | 'contactPhone' | 'name'>;
}

/**
 * Send an SMS via Twilio when a delivery is delayed beyond the threshold.
 * Falls back to console.log if Twilio environment variables are not configured.
 *
 * Required env vars (all must be set):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER  – verified or purchased sending number
 */
export async function notifyDelayActivity({ id, delaySecs, delivery }: NotifyDelayActivityInput) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw ApplicationFailure.nonRetryable('Twilio environment variables are not fully configured');
  }

  // Lazy‐load twilio to avoid bundling it in the isolate if not needed.
  const twilio = await import('twilio');
  const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const toPhone = delivery.contactPhone;
  if (!toPhone) {
    throw ApplicationFailure.nonRetryable('Delivery contactPhone is required to send SMS');
  }

  const body =
    `Hi! Your delivery ${delivery.name} from ${delivery.origin} to ${delivery.destination} is delayed by ${Math.round(delaySecs / 60)} minutes. We will keep you updated.`.trim();

  // Basic idempotency key: hash of recipient + body (caller can pass something better later)
  const idempotencyKey = crypto.createHash('sha256').update(`${toPhone}-${body}`).digest('hex');

  try {
    await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: toPhone,
      // @ts-ignore – twilio types don’t include this yet but API supports it
      idempotencyKey,
    });
    console.log(`[notifyDelayActivity] SMS sent to ${toPhone} (delivery ${id})`);
  } catch (err) {
    console.error('[notifyDelayActivity] Failed to send SMS', err);
    throw err;
  }
}
