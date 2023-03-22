import Layout from '@/components/layout';
import { getAllNotesIds, getNoteData, getSortedNotesData, Note } from '@/lib/notes';
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
  const allNotesData = getSortedNotesData();
  return {
    props: {
      noteData,
      allNotesData
    }
  }
}

export default function NotePage({ noteData, allNotesData }: { noteData: Note, allNotesData: Note[] }) {
  return (
    <Layout allNotesData={allNotesData}>
      <Head>
        <title>{noteData.metadata.title}</title>
      </Head>
      <br />
      <h1>{noteData.metadata.title}</h1>
      <p>{noteData.metadata.date}</p>
      <br />
        <div className='prose'>
          <div dangerouslySetInnerHTML={{ __html: noteData.content }} />
        </div>
    </Layout>
  );
}
