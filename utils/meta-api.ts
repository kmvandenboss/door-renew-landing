// utils/meta-api.ts

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
    fbp?: string;    // Facebook Browser ID
    fbc?: string;    // Facebook Click ID
  };
  custom_data?: {
    location?: string;
    value?: number;
    currency?: string;
    doorIssue?: string;
    event_id?: string;   // For deduplication
  };
  event_id?: string;     // Top-level event_id for deduplication
  opt_out?: boolean;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

// Helper function to hash sensitive data
function hashData(data: string): string {
  if (typeof window === 'undefined') {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }
  return data; // In browser context, return as-is since the pixel handles hashing
}

// Get Facebook click ID from URL
function getFbc(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`;
  }
  return undefined;
}

// Get Facebook browser ID from cookie
function getFbp(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  const fbpCookie = cookies.find(c => c.trim().startsWith('_fbp='));
  return fbpCookie ? fbpCookie.split('=')[1] : undefined;
}

export async function sendMetaEvent(event: MetaEvent) {
  if (!process.env.META_PIXEL_ID || !process.env.META_ACCESS_TOKEN) {
    console.error('Missing required Meta environment variables');
    return null;
  }

  try {
    if (!event.event_name || !event.event_time) {
      throw new Error('Missing required event properties');
    }

    // Generate unique event_id if not provided
    const eventId = event.event_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Hash any PII data in user_data
    const userData = {
      ...event.user_data,
      em: event.user_data.em?.map(email => hashData(email)),
      ph: event.user_data.ph?.map(phone => hashData(phone)),
      fbp: getFbp(),
      fbc: getFbc(),
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

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error(
        `Meta API Error: ${data.error?.message || 'Unknown error'}`
      );
    }

    return data;
  } catch (error) {
    console.error('Error sending Meta event:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Full error details:', error);
    }
    return null;
  }
}