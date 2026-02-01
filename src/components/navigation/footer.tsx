import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground flex items-center justify-between">
        <div>© {new Date().getFullYear()} Comicr</div>
        <div className="space-x-4">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/help" className="hover:text-foreground">
            Help
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
