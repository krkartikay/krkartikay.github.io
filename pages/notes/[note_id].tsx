import Layout from '@/components/layout';
import { getAllNotesIds, getNoteData, getNotesIndex, Note, NotesIndex } from '@/lib/notes';
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
  const allNotesIndex = getNotesIndex();
  return {
    props: {
      note_id: params.note_id,
      noteData,
      allNotesIndex,
    }
  }
}

export default function NotePage({ note_id, noteData, allNotesIndex }: { note_id: string, noteData: Note, allNotesIndex: NotesIndex }) {
  return (
    <Layout allNotesIndex={allNotesIndex} note_id={note_id}>
      <Head>
        <title>{noteData.metadata.title ? noteData.metadata.title : note_id.replace(/__/g, " / ")}</title>
      </Head>
      <br />
      <h1 className='text-4xl dark:text-white'>{noteData.metadata.title}</h1>
      {
        noteData.metadata.date ?
          <p className='text-stone-400 dark:text-stone-300'>{noteData.metadata.date}</p>
          : <br/>
      }
      <div className='prose prose-stone dark:prose-invert'>
        <div dangerouslySetInnerHTML={{ __html: noteData.content }} />
      </div>
    </Layout>
  );
}
