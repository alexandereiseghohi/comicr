import Link from "next/link";

import { auth } from "@/lib/auth-config";

import { SearchTrigger } from "./search-trigger";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link className="text-xl font-semibold" href="/">
            Comicr
          </Link>
          <nav className="hidden space-x-3 md:flex">
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/comics">
              Browse
            </Link>
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/comics">
              New
            </Link>
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/comics">
              Top
            </Link>
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/about">
              About
            </Link>
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/help">
              Help
            </Link>
            <Link className="text-muted-foreground hover:text-foreground text-sm" href="/contact">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <SearchTrigger />
          {user ? (
            <>
              <Link className="text-muted-foreground text-sm" href="/bookmarks">
                Bookmarks
              </Link>
              <Link className="text-sm" href="/profile">
                {user.name ?? user.email}
              </Link>
              <form action="/api/auth/signout" method="post">
                <button className="text-sm text-red-600" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link className="text-sm" href="/sign-in">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
