import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className='dark:bg-black dark:bg-opacity-95'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
