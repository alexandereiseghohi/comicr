import { type Metadata } from "next";
import Link from "next/link";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { SpotlightNew as Spotlight } from "@/components/ui/spotlight";
import * as comicQueries from "@/database/queries/comic-queries";

export const metadata: Metadata = {
  title: "ComicWise - Your Ultimate Comic Reading Platform",
  description:
    "Discover and read thousands of comics, manhwa, and manga. Track your reading progress and never miss an update.",
};

export default async function Home() {
  // Fetch featured and popular comics
  const [featuredResult, popularResult] = await Promise.all([
    comicQueries.getAllComics({ page: 1, limit: 10, sort: "updatedAt", order: "desc" }),
    comicQueries.getAllComics({ page: 1, limit: 8, sort: "views", order: "desc" }),
  ]);

  const featuredComics = featuredResult.success ? featuredResult.data || [] : [];
  const popularComics = popularResult.success ? popularResult.data || [] : [];

  // Transform comics for the infinite scroll component
  const scrollItems = featuredComics.map((comic) => ({
    quote: comic.description || "An amazing comic waiting to be discovered!",
    name: comic.title,
    title: comic.status || "Ongoing",
    image: comic.coverImage || "/images/placeholder.jpg",
  }));

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section with Spotlight */}
      <section className="bg-grid-white/[0.02] relative flex h-[60vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black/[0.96] antialiased md:h-[80vh]">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
        <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
          <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
            ComicWise
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
            Your ultimate destination for comics, manhwa, and manga. Discover new stories, track
            your progress, and join a community of passionate readers.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 text-sm font-semibold transition-colors"
              href="/comics"
            >
              Browse Comics
            </Link>
            <Link
              className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              href="/sign-up"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Comics Carousel */}
      {scrollItems.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-foreground mb-8 text-center text-3xl font-bold">Latest Updates</h2>
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-md antialiased">
              <InfiniteMovingCards direction="right" items={scrollItems} speed="slow" />
            </div>
          </div>
        </section>
      )}

      {/* Popular Comics Grid */}
      {popularComics.length > 0 && (
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-foreground mb-8 text-center text-3xl font-bold">Popular Comics</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {popularComics.slice(0, 8).map((comic) => (
                <Link href={`/comics/${comic.slug}`} key={comic.id}>
                  <BackgroundGradient className="rounded-[22px] p-1">
                    <div className="bg-card flex h-full flex-col rounded-[20px] p-4">
                      <div className="bg-muted relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-lg">
                        {comic.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={comic.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            src={comic.coverImage}
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="text-card-foreground line-clamp-2 text-sm font-semibold">
                        {comic.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {comic.status || "Ongoing"}
                      </p>
                    </div>
                  </BackgroundGradient>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                className="text-primary inline-flex items-center gap-2 hover:underline"
                href="/comics"
              >
                View All Comics
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-foreground mb-12 text-center text-3xl font-bold">Why ComicWise?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary"
                  fill="none"
                  height="28"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">Vast Library</h3>
              <p className="text-muted-foreground">
                Access thousands of comics, manhwa, and manga from various genres and categories.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary"
                  fill="none"
                  height="28"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">Track Progress</h3>
              <p className="text-muted-foreground">
                Bookmark your favorites and track reading progress across all your devices.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary"
                  fill="none"
                  height="28"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">Community</h3>
              <p className="text-muted-foreground">
                Join discussions, share reviews, and connect with fellow comic enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Reading?</h2>
          <p className="mx-auto mb-8 max-w-lg text-neutral-400">
            Create your free account today and unlock unlimited access to our entire comic library.
          </p>
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-full px-10 py-4 text-lg font-semibold transition-colors"
            href="/sign-up"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
