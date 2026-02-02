import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t bg-gray-50">
      <div className="text-muted-foreground container mx-auto flex items-center justify-between px-4 py-6 text-sm">
        <div>© {new Date().getFullYear()} Comicr</div>
        <div className="space-x-4">
          <Link className="hover:text-foreground" href="/about">
            About
          </Link>
          <Link className="hover:text-foreground" href="/help">
            Help
          </Link>
          <Link className="hover:text-foreground" href="/contact">
            Contact
          </Link>
          <Link className="hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-foreground" href="/terms">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
