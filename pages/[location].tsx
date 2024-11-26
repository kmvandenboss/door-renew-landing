import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const LandingPage = dynamic(() => import('../components/LandingPage'), {
  ssr: true,
})

interface LocationPageProps {
  location: string;
}

const LocationPage: NextPage<LocationPageProps> = ({ location }) => {
  return (
    <div>
      <Head>
        <title>Door Renew {location} - Professional Door Refinishing</title>
        <meta 
          name="description" 
          content={`Transform your old door into new in just one day. Serving ${location} and surrounding areas.`} 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LandingPage isLocationSpecific={true} location={location} />
      </main>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locations = ['detroit', 'chicago']
  console.log('Generating paths for locations:', locations)
  
  return {
    paths: locations.map(location => ({
      params: { location }
    })),
    fallback: false
  }
  
  return {
    paths: locations.map(location => ({
      params: { location }
    })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<LocationPageProps> = async ({ params }) => {
  const location = params?.location as string
  const formattedLocation = location
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    props: {
      location: formattedLocation
    }
  }
}

export default LocationPage