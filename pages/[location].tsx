// pages/[location].tsx

import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { getLocations, getLocationBySlug, LocationConfig } from '../config/locations'

const LandingPage = dynamic(() => import('../components/LandingPage'), {
  ssr: true,
})

interface LocationPageProps {
  locationData: LocationConfig;
}

const LocationPage: NextPage<LocationPageProps> = ({ locationData }) => {
  // Add view tracking
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: locationData.slug,
            url: window.location.href
          }),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [locationData.slug]); // Only run when slug changes

  return (
    <div>
      <Head>
        <title>{locationData.meta.title}</title>
        <meta 
          name="description" 
          content={locationData.meta.description}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LandingPage 
          isLocationSpecific={true} 
          location={locationData.name}
          locationData={locationData}
        />
      </main>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locations = getLocations()
  
  return {
    paths: locations.map(location => ({
      params: { location: location.slug }
    })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<LocationPageProps> = async ({ params }) => {
  const locationSlug = params?.location as string
  const locationData = getLocationBySlug(locationSlug)

  if (!locationData) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      locationData
    }
  }
}

export default LocationPage