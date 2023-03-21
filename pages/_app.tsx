import '@/styles/globals.css'
import 'highlight.js/styles/a11y-dark.css';
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  const env = process.env.NODE_ENV
  if (env == "development") {
    return <Component {...pageProps} />;
  }
  return <>
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-927VSS5MXP" id='gtagmgr'></Script>
    <Script id='gtag'>
      {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-927VSS5MXP');`}
    </Script>
    <Component {...pageProps} />
  </>
}
