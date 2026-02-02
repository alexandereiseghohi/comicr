import { redirect } from "next/navigation";

import { auth } from "@/auth";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

/**
 * Profile Layout Component
 * Protects all routes under /profile by requiring authentication
 */
export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile");
  }

  return <>{children}</>;
}
