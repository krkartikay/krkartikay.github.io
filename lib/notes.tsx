import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import {rehype} from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import html from 'remark-html';

const notesDirectory = path.join(process.cwd(), 'notes');

export interface NotesIndex {
  base_name: string,  // base name of this directory, e.g. 'algebra'
  full_path: string,  // full path from current director, e.g. './notes/math/algebra'`
  notes_data: {
    id: string,       // note base names without '.md', e.g. 'clifford_algebra'
    metadata: NotesMetaData // from within the notes file, front matter
  }[],
  directories: NotesIndex[] // directories within this one
}

export interface NotesMetaData {
  title: string,
  date: string,
}

export interface Note {
  metadata: NotesMetaData,
  content: string,
}

export function getNotesIndex(directory_path?: string): NotesIndex {
  if (!directory_path) {
    directory_path = notesDirectory;
  }
  // Get file names under /notes
  const base_name = path.basename(directory_path);
  const fileNames = fs.readdirSync(directory_path);
  const notesIndex: NotesIndex = {
    base_name: base_name,
    full_path: directory_path,
    notes_data: [],
    directories: []
  };
  for (const fileName of fileNames) {
    const fullPath = path.join(directory_path, fileName);
    if (fs.lstatSync(fullPath).isDirectory()) {
      // recurse into the directory
      notesIndex.directories.push(getNotesIndex(path.join(directory_path, fileName)))
    } else {
      if (!fileName.endsWith('.md')) {
        continue;
      }

      // Remove ".md" from file name to get id
      const path = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the note metadata section
      const metadata = matter(fileContents).data as NotesMetaData;

      notesIndex.notes_data.push({
        id: path, metadata: metadata
      })
    }
  }
  return notesIndex;
}

export async function getNoteData(note_id: string) : Promise<Note> {
  const note_path = note_id.replace(/__/g,"/");
  const note_full_path = path.join(notesDirectory, note_path);
  const note_full_path_dir = path.join(notesDirectory, note_path).replace(/\/index$/, "");
  const note_full_path_with_md = note_full_path + '.md';
  if (fs.existsSync(note_full_path_with_md)) {
    const fileContents = fs.readFileSync(note_full_path_with_md, 'utf8');
    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);
    const metadata = matterResult.data as NotesMetaData;
  
    // Use remark to convert markdown into HTML string
    const processedContent = await rehype()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkGfm)
    .use(rehypeHighlight)
    .process(matterResult.content);
    const content = processedContent.toString();
    
    // Combine the data with the id
    return {
      metadata,
      content,
    };
  }
  if (fs.existsSync(note_full_path_dir) && fs.lstatSync(note_full_path_dir).isDirectory()) {
    const filenames = fs.readdirSync(note_full_path_dir);
    let content = 'Pages under this topic:';
    for (const filename of filenames) {
      const note_id_stripped = note_id.replace(/__index$/,'');
      if (filename.endsWith('.md')) {
        const filename_stripped = filename.replace(/.md$/,'');
        content += `<li><a href='/notes/${note_id_stripped}__${filename_stripped}'>${filename_stripped}</a></li>`
      } else {
        const filename_stripped = filename.replace(/.md$/,'');
        content += `<li><a href='/notes/${note_id_stripped}__${filename_stripped}__index'>${filename_stripped}</a></li>`
      }
    }
    return {
      metadata: {title: note_id.substring(note_id.lastIndexOf("/")).replace(/__/g, " / ").replace(/\/ index$/, ""), date: ''},
      content: content
    }
  }
  // UNEXPECTED!
  return {
    metadata: {title: 'Not found! 404', date: ''},
    content: 'The page was not found!'
  }
}

// returns all possible 'note_ids' for SSR
export function getAllNotesIds(base_directory? : string): { params: { note_id: string } }[] {
  if (!base_directory) {
    base_directory = notesDirectory;
  }
  const notesIndex = getNotesIndex(base_directory); // get index at root
  const result: { params: { note_id: string } }[] = [];
  for (const note_data of notesIndex.notes_data) {
    result.push({params: {note_id: note_data.id}});
  }
  for (const directory of notesIndex.directories) {
    result.push({params: {note_id: directory.base_name + '__' + 'index'}})
    const internal_noteIds = getAllNotesIds(path.join(base_directory, directory.base_name));
    for (const internal_noteId of internal_noteIds) {
      result.push({params: {note_id: directory.base_name + '__' + internal_noteId.params.note_id}})
    }
  }
  return result;
}