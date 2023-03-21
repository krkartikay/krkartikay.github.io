import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const notesDirectory = path.join(process.cwd(), 'notes');

export interface NotesMetaData {
  title: string,
  date: string,
}

export interface Note {
  id: string,
  metadata: NotesMetaData,
  content: string,
}

export function getSortedNotesData() : Note[] {
  // Get file names under /notes
  const fileNames = fs.readdirSync(notesDirectory);
  const allNotesData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(notesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the note metadata section
    const metadata = matter(fileContents).data as NotesMetaData;

    // Combine the data with the id
    return {id, metadata, content:""};
  });
  // Sort notes by date
  return allNotesData.sort((a, b) => {
    if (a.metadata.date < b.metadata.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getNoteData(id: string) {
  const fullPath = path.join(notesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);
  const metadata = matterResult.data as NotesMetaData;

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const content = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    metadata,
    content,
  };
}

export function getAllNotesIds() {
  const fileNames = fs.readdirSync(notesDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       note_id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       note_id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName: string) => {
    return {
      params: {
        note_id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}