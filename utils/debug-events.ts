// utils/debug-events.ts

interface EventDebugData {
    event_id?: string;
    user_data?: {
      em?: string[];
      ph?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
      fbp?: string;
      fbc?: string;
      [key: string]: any;
    };
    custom_data?: {
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export function debugEvent(eventName: string, eventData: EventDebugData) {
    if (process.env.NODE_ENV !== 'production') {
      // Create a deep copy to avoid modifying the original data
      const debugData = JSON.parse(JSON.stringify(eventData));
  
      // Mask sensitive data
      if (debugData.user_data) {
        if (debugData.user_data.em) {
          debugData.user_data.em = debugData.user_data.em.map(() => '[MASKED_EMAIL]');
        }
        if (debugData.user_data.ph) {
          debugData.user_data.ph = debugData.user_data.ph.map(() => '[MASKED_PHONE]');
        }
        if (debugData.user_data.client_ip_address) {
          debugData.user_data.client_ip_address = '[MASKED_IP]';
        }
      }
  
      console.log(`[${new Date().toISOString()}] Meta Event Debug - ${eventName}:`, {
        ...debugData,
        event_id: debugData.event_id || 'MISSING_EVENT_ID',
        event_name: eventName,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        pixel_id: process.env.META_PIXEL_ID ? '[PRESENT]' : '[MISSING]',
        access_token: process.env.META_ACCESS_TOKEN ? '[PRESENT]' : '[MISSING]'
      });
    }
  }
  
  // Function to debug API responses
  export function debugMetaResponse(response: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] Meta API Response:`, {
        success: response?.success ?? false,
        events_received: response?.events_received ?? 0,
        messages: response?.messages ?? [],
        fbtrace_id: response?.fbtrace_id ?? 'MISSING'
      });
    }
  }