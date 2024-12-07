// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { storeClickId } from '@/utils/click-tracking';

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

    window.dataLayer = window.dataLayer || [];

    // Track route changes
    const handleRouteChange = (url: string) => {
      window.dataLayer.push({
        event: 'pageview',
        page: url
      });
      
      // Add GA4 pageview
      if (window.gtag) {
        window.gtag('event', 'page_view', {}); // Add the empty object as third parameter
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}