// utils/meta-api.ts

interface MetaEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: 'website';
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string[];  
    ph?: string[];  
  };
  custom_data?: {
    location?: string;
    value?: number;
    currency?: string;
    doorIssue?: string;  // Added this line
    formStep?: string;   // Optional: for tracking different form steps
    formStatus?: string; // Optional: for tracking form status
  };
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

      const payload = {
          data: [event],
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