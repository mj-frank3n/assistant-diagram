import Head from 'next/head'
import Footer from '@components/Footer'
import Diagram from "@components/Diagram";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Diagram />
      </main>

      <Footer />
    </div>
  )
}
