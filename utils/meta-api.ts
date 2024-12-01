// utils/meta-api.ts

interface MetaEvent {
    event_name: string;
    event_time: number;
    event_source_url?: string;
    action_source: 'website';
    user_data: {
      client_ip_address?: string;
      client_user_agent?: string;
      em?: string;  // Hashed email
      ph?: string;  // Hashed phone
    };
    custom_data?: {
      location?: string;
      value?: number;
      currency?: string;
    };
  }
  
  export async function sendMetaEvent(event: MetaEvent) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          access_token: process.env.META_ACCESS_TOKEN,
          test_event_code: process.env.META_TEST_EVENT_CODE, // Remove in production
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Meta API Error: ${JSON.stringify(data)}`);
      }
  
      return data;
    } catch (error) {
      console.error('Error sending Meta event:', error);
      // Don't throw - we don't want to break the main flow if tracking fails
      return null;
    }
  }