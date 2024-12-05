// utils/meta-api.ts

import crypto from 'crypto';
import { getStoredClickId, getFacebookBrowserId } from './click-tracking';

export interface MetaEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: 'website';
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string[];
    ph?: string[];
    fbp?: string;
    fbc?: string;
  };
  custom_data?: {
    location?: string;
    value?: number;
    currency?: string;
    doorIssue?: string;
    event_id?: string;
    utm_source?: string;    // Added
    utm_medium?: string;    // Added
    utm_campaign?: string;  // Added
    lead_type?: string;
  };
  event_id?: string;
}

interface MetaApiResponse {
  success: boolean;
  events_received?: number;
  messages?: string[];
  fbtrace_id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Hashes sensitive data using SHA256
 */
export function hashData(data: string): string {
  if (typeof window === 'undefined') {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }
  return data;
}

/**
 * Generates a deterministic event ID for deduplication
 */
function generateEventId(event: MetaEvent): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const sourceData = `${event.event_name}_${timestamp}_${JSON.stringify(event.custom_data || {})}`;
  return hashData(sourceData);
}

/**
 * Sends an event to Meta's Conversion API with retry logic
 */
export async function sendMetaEvent(event: MetaEvent, retryCount = 0): Promise<MetaApiResponse | null> {
  if (!process.env.META_PIXEL_ID || !process.env.META_ACCESS_TOKEN) {
    console.error('Missing required Meta environment variables');
    return null;
  }

  try {
    // Generate deterministic event_id if not provided
    const eventId = event.event_id || generateEventId(event);

    // Hash any PII data in user_data
    const userData = {
      ...event.user_data,
      em: event.user_data.em?.map(email => hashData(email)),
      ph: event.user_data.ph?.map(phone => hashData(phone.replace(/\D/g, ''))), // Remove non-digits before hashing
      fbp: event.user_data.fbp || getFacebookBrowserId(),
      fbc: event.user_data.fbc || getStoredClickId()
    };

    const payload = {
      data: [{
        ...event,
        event_id: eventId,
        user_data: userData,
        event_source_url: event.event_source_url || (typeof window !== 'undefined' ? window.location.href : undefined),
        data_processing_options: ['LDU'],
        data_processing_options_country: 1,
        data_processing_options_state: 1000,
      }],
      access_token: process.env.META_ACCESS_TOKEN,
      ...(process.env.NODE_ENV !== 'production' && process.env.META_TEST_EVENT_CODE 
        ? { test_event_code: process.env.META_TEST_EVENT_CODE }
        : {})
    };

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending Meta event:', {
        event_name: event.event_name,
        event_id: eventId,
        has_fbp: !!userData.fbp,
        has_fbc: !!userData.fbc,
        payload: JSON.stringify(payload, null, 2)
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const data: MetaApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Unknown error');
    }

    // Log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Meta API Response:', data);
    }

    return data;
  } catch (error) {
    console.error('Error sending Meta event:', error);

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return sendMetaEvent(event, retryCount + 1);
    }

    return null;
  }
}

/**
 * Batches multiple events into a single API call
 */
export async function sendMetaEventsBatch(events: MetaEvent[]): Promise<MetaApiResponse | null> {
  if (!events.length) return null;

  try {
    const batchedEvents = events.map(event => ({
      ...event,
      event_id: event.event_id || generateEventId(event),
      user_data: {
        ...event.user_data,
        em: event.user_data.em?.map(email => hashData(email)),
        ph: event.user_data.ph?.map(phone => hashData(phone.replace(/\D/g, ''))),
        fbp: event.user_data.fbp || getFacebookBrowserId(),
        fbc: event.user_data.fbc || getStoredClickId()
      }
    }));

    const payload = {
      data: batchedEvents,
      access_token: process.env.META_ACCESS_TOKEN,
      ...(process.env.NODE_ENV !== 'production' && process.env.META_TEST_EVENT_CODE 
        ? { test_event_code: process.env.META_TEST_EVENT_CODE }
        : {})
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const data: MetaApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('Error sending Meta events batch:', error);
    return null;
  }
}