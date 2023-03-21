import Head from 'next/head'
import Image from 'next/image'
import { getNotesIndex, Note, NotesIndex } from '@/lib/notes';
import Link from 'next/link';
import Layout from '@/components/layout';

export async function getStaticProps() {
  const allNotesIndex = getNotesIndex();
  return {
    props: {
      allNotesIndex,
    },
  };
}

export default function Home({ allNotesIndex }: { allNotesIndex: NotesIndex }) {
  return (
    <Layout allNotesIndex={allNotesIndex} note_id=''>
      <Head>
        <title>krkartikay&apos;s notes</title>
      </Head>
      <div className='prose prose-stone dark:prose-invert'>
        <h1>Hi!</h1>
        <h2>I&apos;m Kartikay.</h2>
        <p>
          I&apos;m a software engineer. I&apos;m currently working for Google.
        </p>
        <p>
          I like to code, read books and study in my free time.
        </p>
        <p>
          You can find some of my projects on my {` `}
          <Link href="https://github.com/krkartikay">github profile</Link>,
          and some of my notes on this website.
        </p>
        <p>
          Feel free to contact me at <a href="mailto:krkartikay@gmail.com">krkartikay@gmail.com</a>.
        </p>
      </div>
    </Layout>
  )
}
