import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Door Renew - Professional Door Refinishing</title>
        <meta name="description" content="Transform your old door into new in just one day" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Door Renew Landing Page
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Professional Door Refinishing Services
          </p>
        </div>
      </main>
    </div>
  )
}

export default Home
