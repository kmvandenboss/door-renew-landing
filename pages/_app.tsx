// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { storeClickId } from '@/utils/click-tracking';

// Extend Window interface to include dataLayer, keeping existing gtag definition
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    storeClickId();
    
    // Add debug initialization for Meta
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID, { debug: true });
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Track initial page view
    window.dataLayer.push({
      event: 'pageview',
      page: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      language: navigator.language,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track route changes
    const handleRouteChange = (url: string) => {
      window.dataLayer.push({
        event: 'pageview',
        page: url,
        page_title: document.title,
        page_location: window.location.href,
        timestamp: new Date().toISOString(),
        previous_page: window.location.pathname,
        user_agent: navigator.userAgent,
        language: navigator.language,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      });
    };

    // Debug GTM in development
    if (process.env.NODE_ENV === 'development') {
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
        debug_mode: true
      });

      // Log GTM initialization
      console.log('GTM Initialization:', {
        containerId: 'GTM-PNM9N93P',
        environment: process.env.NODE_ENV,
        debug: true
      });

      // Log GA4 configuration
      console.log('GA4 Configuration:', {
        measurementId: 'G-DG8N4M6EFR',
        debug: true
      });
    }

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}