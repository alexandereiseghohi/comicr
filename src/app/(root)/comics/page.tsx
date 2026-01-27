import { Suspense } from 'react';
import { ComicFilters } from '@/components/comics/comic-filters';
import { ComicList } from '@/components/comics/comic-list';
import * as comicQueries from '@/database/queries/comic-queries';

interface SearchParams {
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
}

async function ComicsContent({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const sort = searchParams.sort || 'createdAt';
  const order = searchParams.order === 'asc' ? 'asc' : 'desc';

  let result;

  if (searchParams.search) {
    result = await comicQueries.searchComics(searchParams.search, { page, limit });
  } else if (searchParams.status && searchParams.status !== 'All') {
    result = await comicQueries.getComicsByStatus(searchParams.status, { page, limit, sort, order });
  } else {
    result = await comicQueries.getAllComics({ page, limit, sort, order });
  }

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">Error loading comics</h3>
          <p className="text-sm text-slate-600 mt-2">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ComicList comics={(result.data || []).map(c => ({
        ...c,
        rating: c.rating ? Number(c.rating) : 0
      }))} />
    </div>
  );
}

export default async function ComicsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-950 mb-2">Comics</h1>
          <p className="text-lg text-slate-600">Discover and read amazing comics</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ComicFilters />
        </div>

        {/* Content */}
        <Suspense fallback={<div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-lg h-72 animate-pulse" />
          ))}
        </div>}>
          <ComicsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Comics | ComicWise',
  description: 'Browse and read amazing comics',
};
