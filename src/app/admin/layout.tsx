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

import { auth } from "@/lib/auth-config";
import { cn } from "@/lib/utils";

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
  const user = session?.user as { email?: string; name?: string; role?: string; } | undefined;

  // Redirect non-admins
  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link className="text-lg font-semibold" href="/admin">
              Admin Panel
            </Link>
            <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{user.name ?? user.email}</span>
            <Link className="text-primary text-sm hover:underline" href="/">
              View Site
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-[57px] hidden min-h-[calc(100vh-57px)] w-64 border-r bg-white md:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink href={item.href} icon={item.icon} key={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-2">
            <h3 className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
              Metadata
            </h3>
          </div>
          <nav className="space-y-1 px-4 pb-4">
            {metadataItems.map((item) => (
              <NavLink href={item.href} icon={item.icon} key={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <nav className="fixed right-0 bottom-0 left-0 z-40 flex justify-around border-t bg-white py-2 md:hidden">
          {navItems.slice(0, 4).map((item) => (
            <Link
              className="text-muted-foreground hover:text-primary flex flex-col items-center gap-1 text-xs"
              href={item.href}
              key={item.href}
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
  children: React.ReactNode;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-colors"
      )}
      href={href}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{children}</span>
      <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
    </Link>
  );
}
