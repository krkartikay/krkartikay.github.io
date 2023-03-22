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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean pellentesque dictum purus ac tempus. In sagittis iaculis libero vehicula malesuada. Suspendisse lectus erat, porta blandit viverra sed, sagittis eu risus. In vitae tortor nulla. Maecenas mattis ipsum nisi, ut tristique arcu fringilla ac. Maecenas tincidunt non lacus nec eleifend. Praesent accumsan porta urna vel malesuada. Donec accumsan convallis aliquam. Maecenas vestibulum neque sed neque pretium porta. Phasellus porta maximus leo a egestas. Sed dui risus, feugiat ac blandit a, pharetra nec lacus. Etiam dictum odio vel urna vulputate fermentum. Nullam viverra risus ac lectus tincidunt scelerisque.
        </p>
        <p>
          Vivamus viverra eu felis eu tincidunt. Pellentesque efficitur lorem nec metus molestie egestas. Etiam odio ante, finibus eget tempor at, tincidunt ac enim. Sed tincidunt ante ut libero lobortis, vel pulvinar nisi sodales. Maecenas id luctus urna, ac luctus diam. Suspendisse potenti. Pellentesque viverra posuere tincidunt. Suspendisse vel enim in dolor posuere rutrum ac eu nunc. Nulla facilisi. Donec sodales lectus nec leo convallis, condimentum ultrices sapien pharetra. Fusce malesuada efficitur lacus, iaculis pharetra leo faucibus sed.
        </p>
        <p>
          Etiam et tempor magna. Vestibulum eu tortor ut mauris gravida viverra. Nam ut volutpat libero. Vestibulum euismod varius facilisis. Curabitur nisl odio, gravida sodales lacinia quis, porttitor posuere nunc. Morbi blandit pulvinar metus, rutrum iaculis erat ornare eget. Aenean lobortis quam vel sem ornare euismod. Ut id tristique mauris. Vivamus placerat tempor sem sit amet ullamcorper. In vehicula dictum ligula, vel imperdiet ex semper sed.
        </p>
        <p>
          Mauris tellus purus, posuere eu bibendum id, congue vestibulum turpis. Duis at ligula dapibus, porttitor dolor a, accumsan libero. Mauris consectetur quam leo, a pretium eros ullamcorper quis. Curabitur tincidunt enim id viverra porttitor. Donec aliquet dapibus magna in aliquet. Pellentesque vel egestas tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. In tincidunt dictum mollis. Nam pretium mi mauris, feugiat bibendum lectus hendrerit at. Sed eget quam id nunc ornare elementum ac eget odio. Mauris urna mauris, malesuada non luctus a, ultrices sed risus. Nullam non lobortis turpis, eget varius ipsum. Morbi at enim auctor purus interdum placerat. Duis at massa nec mi fringilla facilisis at tincidunt arcu. Donec tincidunt nunc lobortis leo consectetur, sed tempor tellus condimentum. Vivamus vehicula augue a cursus mattis.
        </p>
        <p>
          Morbi luctus ligula a sem ornare, non consequat ipsum malesuada. Vivamus varius auctor lacinia. Curabitur volutpat odio ligula. Sed quis condimentum est. Mauris blandit nunc quis tellus viverra, quis egestas magna ullamcorper. Morbi finibus turpis leo, quis aliquam leo tincidunt a. Donec placerat libero est, id laoreet nunc imperdiet ut. Pellentesque at metus erat. Curabitur consectetur varius justo, pretium malesuada sem fringilla in. In felis tellus, luctus in ligula at, scelerisque vulputate turpis. Pellentesque elementum, arcu vitae vestibulum mollis, nisl turpis blandit tortor, eu elementum felis risus a augue.
        </p>
      </div>
    </Layout>
  )
}
