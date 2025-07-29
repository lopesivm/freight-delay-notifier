import { ApplicationFailure } from '@temporalio/common';

export interface GenerateDelayMessageInput {
  minutes: number;
  origin: string;
  destination: string;
}

/**
 * Generates a user-friendly delay message using OpenAI.
 * Falls back to a canned string if the API key is missing or the request fails.
 */
export async function generateDelayMessageActivity({
  minutes,
  origin,
  destination,
}: GenerateDelayMessageInput): Promise<string> {
  const { OPENAI_API_KEY } = process.env;
  const fallback = `Heads up: your freight is running about ${minutes} minutes late. We'll update you soon.`;

  if (!OPENAI_API_KEY) {
    // Non-retryable because it won't succeed until the worker is restarted with the key.
    throw ApplicationFailure.nonRetryable('OPENAI_API_KEY is missing');
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly logistics assistant. Respond with a SHORT, friendly SMS apology + update. MAX 200 characters. Do NOT add placeholders or quotation marks.',
          },
          {
            role: 'user',
            content: `Shipment from ${origin} to ${destination} delayed by ${minutes} min. Compose the SMS in ≤200 chars, personable tone.`,
          },
        ],
        temperature: 0.5,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI failed: ${res.status}`);
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (err) {
    console.error('[generateDelayMessageActivity] Falling back due to error:', err);
    return fallback;
  }
}
