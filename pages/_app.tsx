import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { storeClickId } from '@/utils/click-tracking';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    storeClickId();
  }, []);

  return <Component {...pageProps} />;
}