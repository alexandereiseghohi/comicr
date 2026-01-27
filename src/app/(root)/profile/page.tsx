import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="p-4 bg-white border rounded-md">
        <p className="text-sm">
          <strong>Name:</strong> {user?.name ?? "—"}
        </p>
        <p className="text-sm">
          <strong>Email:</strong> {user?.email ?? "—"}
        </p>
        <p className="text-sm">
          <strong>Role:</strong>{" "}
          {(user as { role?: "admin" | "moderator" | "user" })?.role ?? "user"}
        </p>
      </div>
      <div>
        <a className="text-sm text-blue-600" href="/profile/edit">
          Edit profile
        </a>
      </div>
    </div>
  );
}
