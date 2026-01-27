import { ComicCard } from './comic-card';

interface Comic {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  status: string;
  views: number;
  rating: number | string;
  author?: {
    name: string;
  };
}

interface ComicListProps {
  comics: Comic[];
  isLoading?: boolean;
}

export function ComicList({ comics, isLoading }: ComicListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-slate-200 rounded-lg h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">No comics found</h3>
          <p className="text-sm text-slate-600 mt-2">
            Try adjusting your search parameters or browse all comics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {comics.map((comic) => (
        <ComicCard
          key={comic.id}
          id={comic.id}
          title={comic.title}
          slug={comic.slug}
          coverImage={comic.coverImage}
          description={comic.description}
          status={comic.status}
          views={comic.views}
          rating={Number(comic.rating) || 0}
          authorName={comic.author?.name}
        />
      ))}
    </div>
  );
}
