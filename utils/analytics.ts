// utils/analytics.ts
interface EventParams {
  [key: string]: any;
  event_category?: string;
  event_label?: string;
  value?: number;
}

export const trackEvent = (eventName: string, params?: EventParams) => {
  if (typeof window !== 'undefined') {
    // Add common parameters to all events
    const eventParams = {
      ...params,
      event_timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language
    };

    // Push to dataLayer for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });

    // Send to Meta if it's a standard event
    if (window.fbq) {
      switch(eventName) {
        case 'form_submission':
          window.fbq('track', 'Lead', { 
            source: 'form',
            ...params 
          });
          break;
        case 'phone_click':
          window.fbq('track', 'Lead', { 
            source: 'phone',
            ...params 
          });
          break;
        case 'form_start':
          window.fbq('track', 'InitiateCheckout', params);
          break;
      }
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`Analytics Event: ${eventName}`);
      console.log('Event Parameters:', eventParams);
      console.log('DataLayer State:', window.dataLayer);
      console.groupEnd();
    }
  }
};

export const trackFormSubmission = (location?: string) => {
  trackEvent('form_submission', {
    event_category: 'form',
    event_label: location || 'general',
    form_type: 'lead',
    form_name: 'quote_request',
    conversion: true,
    timestamp: new Date().toISOString()
  });
};

export const trackSecondStepSubmission = (hasImages: boolean, location?: string) => {
  trackEvent('form_step_two', {
    event_category: 'form',
    event_label: location || 'general',
    has_images: hasImages,
    form_name: 'quote_request',
    form_step: 2,
    timestamp: new Date().toISOString()
  });
};

export const trackCallButtonClick = (location?: string) => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    event_label: location || 'general',
    interaction_type: 'call',
    conversion: true,
    timestamp: new Date().toISOString()
  });
};

export const trackTimeOnPage = () => {
  let timeSpent = 0;
  const startTime = Date.now();
  
  const interval = setInterval(() => {
    timeSpent += 30;
    if (timeSpent <= 180) { // Track up to 3 minutes
      trackEvent('time_on_page', {
        event_category: 'engagement',
        event_label: 'duration',
        time_spent: timeSpent,
        time_spent_seconds: timeSpent,
        page_url: window.location.href,
        start_time: new Date(startTime).toISOString(),
        current_time: new Date().toISOString()
      });
    } else {
      clearInterval(interval);
    }
  }, 30000); // Every 30 seconds

  // Return cleanup function
  return () => {
    clearInterval(interval);
    // Track final time on page when component unmounts
    const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    trackEvent('page_exit', {
      event_category: 'engagement',
      event_label: 'duration',
      time_spent: finalTimeSpent,
      time_spent_seconds: finalTimeSpent,
      page_url: window.location.href,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date().toISOString()
    });
  };
};

// Export type for TypeScript support
export type TrackEventFunction = typeof trackEvent;