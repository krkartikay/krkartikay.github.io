import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { getSortedNotesData, Note } from '@/lib/notes';
import Link from 'next/link';

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
    <>
      <Image src="/pfp_blank.png" alt="Profile pic" width={100} height={100} className="rounded-full"></Image>
      <h1>krkartikay&apos;s Notes</h1>
      <section>
        <h2>Index</h2>
        <ul>
          {allNotesData.map(({ id, metadata }) => (
            <li key={id}>
              <Link href={`/notes/${id}`}>{metadata.title}</Link>
              <br />
              <small>
                {metadata.date}
              </small>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
