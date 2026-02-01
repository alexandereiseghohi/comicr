import { auth } from "@/lib/auth-config";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  ChevronRightIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  PenToolIcon,
  SettingsIcon,
  TagIcon,
  TypeIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/comics", label: "Comics", icon: BookOpenIcon },
  { href: "/admin/chapters", label: "Chapters", icon: FileTextIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const metadataItems = [
  { href: "/admin/authors", label: "Authors", icon: PenToolIcon },
  { href: "/admin/artists", label: "Artists", icon: PaletteIcon },
  { href: "/admin/genres", label: "Genres", icon: TagIcon },
  { href: "/admin/types", label: "Types", icon: TypeIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();
  const user = session?.user as { role?: string; name?: string; email?: string } | undefined;

  // Redirect non-admins
  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold text-lg">
              Admin Panel
            </Link>
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name ?? user.email}</span>
            <Link href="/" className="text-sm text-primary hover:underline">
              View Site
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-57px)] sticky top-[57px] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Metadata
            </h3>
          </div>
          <nav className="px-4 pb-4 space-y-1">
            {metadataItems.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-colors"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{children}</span>
      <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
    </Link>
  );
}
