import Link from 'next/link';
import Image from 'next/image'
import { PropsWithChildren, ReactElement } from "react";
import { Note, NotesIndex } from '@/lib/notes';

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function NotesTree({ allNotesIndex, prefix, current_note_id }: { allNotesIndex: NotesIndex, prefix?: string, current_note_id : string }) {
  if (!prefix) {
    prefix = ''
  }
  const all_pages: {title: string, page: ReactElement}[] = [];
  for (const note of allNotesIndex.notes_data){
    if (note.id == 'index')
      continue;
    const note_link =
      <Link href={`/notes/${prefix}${note.id}`} key={note.id}>
        <li className={`py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 list-inside ${(prefix+note.id == current_note_id) ? 'font-bold bg-stone-50 dark:bg-stone-800' : ''}`}>
          {note.metadata.title}
        </li>
      </Link>
    all_pages.push({title: note.metadata.title, page: note_link});
  }
  for (const directory of allNotesIndex.directories) {
    const page_link = <>
      <Link href={`/notes/${prefix}${directory.base_name}__index`} key={directory.base_name}>
        <li className={`py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 list-inside ${(prefix+directory.base_name+'__index' == current_note_id) ? 'font-bold bg-stone-50 dark:bg-stone-800' : ''}`}>
          {toTitleCase(directory.base_name)}
        </li>
      </Link>
      <NotesTree allNotesIndex={directory} prefix={prefix + directory.base_name + '__'} current_note_id={current_note_id}></NotesTree>
    </>
    all_pages.push({title: toTitleCase(directory.base_name), page: page_link});
  }
  all_pages.sort((a, b) => (a.title < b.title) ? -1: (a.title == b.title ? 0 : 1))
  return <>
    <ul className='list-disc pl-8'>
      {all_pages.map(({title, page}) => page)}
    </ul>
  </>;
}

export default function Layout({ allNotesIndex, note_id, children }: PropsWithChildren<{ allNotesIndex: NotesIndex, note_id: string }>) {
  return <div>
    <nav className='md:sticky md:top-0 md:z-40 shadow-sm p-2 bg-white dark:bg-black dark:shadow-lg dark:shadow-stone-800'>
      <div className='flex items-center'>
        <Link href={`/`} className="flex">
          <Image src="/pfp_blank.png" alt="Profile pic"
            width={100} height={100}
            className="rounded-full h-20 w-20 mx-2"></Image>
          <h1 className='self-center text-xl text-stone-400 font-mono dark:text-stone-50 dark:drop-shadow-2xl dark:shadow-white dark:hover:text-stone-200'>
            krkartikay&apos;s notes
          </h1>
        </Link>
      </div>
    </nav>
    {/* Main content */}
    <div className='flex flex-row flex-wrap'>
      {/* Sidebar */}
      <aside className='md:w-1/4 text-stone-500 dark:text-stone-200'>
        <div className='max-w-md mx-auto py-8'>
          <Link href={`/`}>
            <h2 className={`p-8 text-lg text-stone-600 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-200 ${(note_id == '') ? 'font-bold bg-stone-50 dark:bg-stone-800' : ''}`}>Notes</h2>
          </Link>
          <NotesTree allNotesIndex={allNotesIndex} current_note_id={note_id}></NotesTree>
        </div>
      </aside>
      {/* Main Content */}
      <main className='md:w-3/4 border-l-2 dark:border-l-stone-900 border-l-stone-50'>
        <div className='p-8 md:p-16'>
            {children}
        </div>
      </main>
    </div>
  </div>
}