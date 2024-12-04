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
          case 'timeOnPage':
            // Don't send to Meta - not a standard event
            break;
          default:
            console.log('Non-standard event:', eventName);
        }
      }
    }
  };
  
  export const trackFormSubmission = () => {
    trackEvent('formSubmission');
  };
  
  export const trackSecondStepSubmission = (hasImages: boolean) => {
    // This is part of the form submission flow, no need for separate Meta event
    trackEvent('secondStepSubmission', { hasImages });
  };
  
  export const trackCallButtonClick = () => {
    trackEvent('callButtonClick');
  };
  
  export const trackTimeOnPage = () => {
    trackEvent('timeOnPage');
  };