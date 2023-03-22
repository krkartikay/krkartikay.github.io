import Head from 'next/head'
import Image from 'next/image'
import { getSortedNotesData, Note } from '@/lib/notes';
import Link from 'next/link';
import Layout from '@/components/layout';

export async function getStaticProps() {
  const allNotesData = getSortedNotesData();
  return {
    props: {
      allNotesData,
    },
  };
}

export default function Home({ allNotesData }: { allNotesData: Note[] }) {
  return (
    <Layout allNotesData={allNotesData}>
      <div>
        <h1>Hi!</h1>
        <p>
          I&apos;m a software engineer. I am currently working for Google.
        </p>
        <p>
          I like to code in my free time.
        </p>
        <p>
          You can find some of my projects on my {` `}
          <Link href="https://github.com/krkartikay">github profile</Link>,
          and some of my notes on this website.
        </p>
        <p>
          Feel free to reach me at <a href="mailto:krkartikay@gmail.com">krkartikay@gmail.com</a>.
        </p>
      </div>
    </Layout>
  )
}
