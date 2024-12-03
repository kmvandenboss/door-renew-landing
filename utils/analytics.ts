declare global {
    interface Window {
      dataLayer: any[];
    }
  }
  
  export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }
  };
  
  export const trackFormSubmission = () => {
    trackEvent('formSubmission');
  };
  
  export const trackSecondStepSubmission = (hasImages: boolean) => {
    trackEvent('secondStepSubmission', { has_images: hasImages });
  };
  
  export const trackCallButtonClick = () => {
    trackEvent('callButtonClick');
  };
  
  export const trackTimeOnPage = () => {
    trackEvent('timeOnPage');
  };