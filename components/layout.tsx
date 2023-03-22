import Link from 'next/link';
import Image from 'next/image'
import { PropsWithChildren } from "react";
import { Note } from '@/lib/notes';

export default function Layout({ allNotesData, children }: PropsWithChildren<{ allNotesData: Note[] }>) {
  return <div>
    <nav className='md:sticky md:top-0 md:z-40 shadow-sm p-2 bg-white'>
      <div className='flex items-center'>
        <Link href={`/`} className="flex">
          <Image src="/pfp_blank.png" alt="Profile pic"
            width={100} height={100}
            className="rounded-full h-20 w-20 mx-2"></Image>
          <h1 className='self-center text-xl text-stone-400 font-mono'>
            krkartikay&apos;s notes
          </h1>
        </Link>
      </div>
    </nav>
    {/* Main content */}
    <div className='flex flex-row flex-wrap'>
      {/* Sidebar */}
      <aside className='sm:w-1/4 text-stone-500'>
        <div className='max-w-xs mx-auto py-8'>
          <Link href={`/`}>
            <h2 className='p-8 text-lg text-stone-600 hover:bg-stone-100'>Notes</h2>
          </Link>
          <ul className='list-disc pl-8'>
            {allNotesData.map(({ id, metadata }) => (
              <Link href={`/notes/${id}`} key={id}>
                <li className='py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 list-inside'>
                  {metadata.title}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className='sm:w-3/4'>
        <div className='p-8 md:p-16'>
          <div className="prose prose-stone">
            {children}
          </div>
        </div>
      </main>
    </div>
  </div>
}