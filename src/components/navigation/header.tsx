import { auth } from "@/lib/auth-config";
import Link from "next/link";
import { SearchTrigger } from "./search-trigger";

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-semibold">
            Comicr
          </Link>
          <nav className="hidden md:flex space-x-3">
            <Link href="/comics" className="text-sm text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link href="/comics" className="text-sm text-muted-foreground hover:text-foreground">
              New
            </Link>
            <Link href="/comics" className="text-sm text-muted-foreground hover:text-foreground">
              Top
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Help
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <SearchTrigger />
          {user ? (
            <>
              <Link href="/bookmarks" className="text-sm text-muted-foreground">
                Bookmarks
              </Link>
              <Link href="/profile" className="text-sm">
                {user.name ?? user.email}
              </Link>
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="text-sm text-red-600">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/sign-in" className="text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
