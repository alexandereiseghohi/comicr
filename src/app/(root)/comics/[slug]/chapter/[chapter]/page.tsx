export default function ChapterReader({ params }: { params: { slug: string; chapter: string } }) {
  return (
    <main>
      <h1>
        Reader — {params.slug} — Chapter {params.chapter}
      </h1>
      <div role="region" aria-label="reader">
        <p>Image viewer placeholder</p>
      </div>
    </main>
  );
}
