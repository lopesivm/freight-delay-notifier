import crypto from 'crypto';
import twilio from 'twilio';
import { ApplicationFailure } from '@temporalio/common';

export interface NotifyDelayActivityInput {
  id: string;
  contactPhone: string;
  message: string;
}

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const twilioClientSingleton =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

export async function notifyDelayActivity(
  { id, contactPhone, message }: NotifyDelayActivityInput,
  client = twilioClientSingleton,
) {
  if (!client) {
    throw ApplicationFailure.nonRetryable('Twilio environment variables are not fully configured');
  }

  const toPhone = contactPhone;
  if (!toPhone) {
    throw ApplicationFailure.nonRetryable('contactPhone is required to send SMS');
  }

  const body = message.trim();

  const idempotencyKey = crypto.createHash('sha256').update(`${toPhone}-${id}`).digest('hex');

  try {
    const twilioResp = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER!,
      to: toPhone,
      // @ts-ignore – twilio types don’t include this yet but API supports it
      idempotencyKey,
    });

    console.log(`[notifyDelayActivity] SMS ${twilioResp.sid} sent to ${toPhone} (delivery ${id})`);
  } catch (err) {
    console.error('[notifyDelayActivity] Failed to send SMS', err);
    throw err;
  }
}
