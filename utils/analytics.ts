// utils/analytics.ts

declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Push to dataLayer for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params
    });

    // Add GA4 tracking while maintaining existing event names
    if (window.gtag) {
      window.gtag('event', eventName, params || {}); // Add the || {} to ensure an object is always passed
    }

    // Send to Meta if it's a standard event
    if (window.fbq) {
      switch(eventName) {
        case 'formSubmission':
          window.fbq('track', 'Lead', { 
            source: 'form',
            ...params 
          });
          break;
        case 'callButtonClick':
          window.fbq('track', 'Lead', { 
            source: 'phone',
            ...params 
          });
          break;
        case 'formStart':
          window.fbq('track', 'InitiateCheckout', params);
          break;
      }
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('DataLayer Event:', {
        event: eventName,
        ...params
      });
    }
  }
};

export const trackFormSubmission = (location?: string) => {
  trackEvent('formSubmission', {
    event_category: 'form',
    event_label: location || 'general',
    form_type: 'lead'
  });
};

export const trackSecondStepSubmission = (hasImages: boolean, location?: string) => {
  trackEvent('secondStepSubmission', {
    event_category: 'form',
    event_label: location || 'general',
    has_images: hasImages
  });
};

export const trackCallButtonClick = (location?: string) => {
  trackEvent('callButtonClick', {
    event_category: 'engagement',
    event_label: location || 'general'
  });
};

export const trackTimeOnPage = () => {
  let timeSpent = 0;
  const interval = setInterval(() => {
    timeSpent += 30;
    if (timeSpent <= 180) { // Track up to 3 minutes
      trackEvent('timeOnPage', {
        event_category: 'engagement',
        time_spent: timeSpent
      });
    } else {
      clearInterval(interval);
    }
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
};