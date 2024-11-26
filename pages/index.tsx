import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const LandingPage = dynamic(() => import('../components/LandingPage'), {
  ssr: true,
})

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Door Renew - Professional Door Refinishing</title>
        <meta name="description" content="Transform your old door into new in just one day" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LandingPage isLocationSpecific={false} />
      </main>
    </div>
  )
}

export default Home