import Layout from '@/components/layout';
import { getAllNotesIds, getNoteData, Note } from '@/lib/notes';
import Head from 'next/head';

interface NoteParams {
  params: { note_id: string }
}

export async function getStaticPaths() {
  const paths = getAllNotesIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: NoteParams) {
  const noteData = await getNoteData(params.note_id);
  return {
    props: {
      noteData
    }
  }
}

export default function NotePage({ noteData }: { noteData: Note }) {
  return (
    <Layout>
      <Head>
        <title></title>
      </Head>
      <br />
      <h1>{noteData.metadata.title}</h1>
      <p>{noteData.metadata.date}</p>
      <br />
      <div dangerouslySetInnerHTML={{ __html: noteData.content }} />
    </Layout>
  );
}
