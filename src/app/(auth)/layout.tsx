import { redirect } from "next/navigation";

import { auth } from "@/auth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth Layout Component
 * Redirects already authenticated users to home page
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
