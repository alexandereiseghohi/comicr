import { ComicCard } from "./comic-card";

interface Comic {
  author?: {
    name: string;
  };
  coverImage: string;
  description: string;
  id: number;
  rating: number | string;
  slug: string;
  status: string;
  title: string;
  views: number;
}

interface ComicListProps {
  comics: Comic[];
  isLoading?: boolean;
}

export function ComicList({ comics, isLoading }: ComicListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="h-72 animate-pulse rounded-lg bg-slate-200" key={i} />
        ))}
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">No comics found</h3>
          <p className="mt-2 text-sm text-slate-600">Try adjusting your search parameters or browse all comics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {comics.map((comic) => (
        <ComicCard
          authorName={comic.author?.name}
          coverImage={comic.coverImage}
          description={comic.description}
          id={comic.id}
          key={comic.id}
          rating={Number(comic.rating) || 0}
          slug={comic.slug}
          status={comic.status}
          title={comic.title}
          views={comic.views}
        />
      ))}
    </div>
  );
}
