import ProfileForm from "@/components/profile/profile-form";
import { db } from "@/database/db";
import {
  changeUserEmail,
  changeUserPassword,
  updateUserById,
} from "@/database/mutations/user.mutations";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth-config";
import { hashPassword, verifyPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await auth();
  const me = session?.user;

  if (!me) redirect("/sign-in");

  // Server action to update profile (non-JS fallback)
  async function updateProfileAction(form: FormData) {
    "use server";
    const name = form.get("name") as string | null;
    const image = form.get("image") as string | null;
    if (!me?.id) return;
    await updateUserById(me.id, { name: name ?? null, image: image ?? null });
  }

  // Server action to change password
  async function changePasswordAction(form: FormData) {
    "use server";
    const currentPassword = form.get("currentPassword") as string | null;
    const newPassword = form.get("newPassword") as string | null;
    if (!me?.id || !currentPassword || !newPassword) return;

    const rows = await db.select().from(user).where(eq(user.id, me.id));
    const dbUser = rows[0];
    if (!dbUser || !dbUser.password) return;

    const ok = verifyPassword(currentPassword, dbUser.password);
    if (!ok) return;

    const hashed = hashPassword(newPassword);
    await changeUserPassword(me.id, hashed);
  }

  // Server action to change email
  async function changeEmailAction(form: FormData) {
    "use server";
    const currentPassword = form.get("currentPasswordForEmail") as string | null;
    const newEmail = form.get("newEmail") as string | null;
    if (!me?.id || !newEmail) return;

    const rows = await db.select().from(user).where(eq(user.id, me.id));
    const dbUser = rows[0];
    if (!dbUser) return;

    if (dbUser.password) {
      if (!currentPassword) return;
      const ok = verifyPassword(currentPassword, dbUser.password);
      if (!ok) return;
    }

    await changeUserEmail(me.id, newEmail);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>

      <div>
        <h2 className="text-lg font-medium">Browser (client) form</h2>
        <ProfileForm
          defaultName={me?.name ?? ""}
          defaultImage={(me as { image?: string })?.image ?? ""}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium">Server (non-JS) form</h2>
        <form action={updateProfileAction} className="p-4 bg-white border rounded-md space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input
              name="name"
              defaultValue={me?.name ?? ""}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Image URL</label>
            <input
              name="image"
              defaultValue={(me as { image?: string })?.image ?? ""}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
            <a href="/profile" className="text-sm text-muted-foreground">
              Cancel
            </a>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="p-4 bg-white border rounded-md">
          <h3 className="font-medium">Change Password</h3>
          <form action={changePasswordAction} className="space-y-3 mt-2">
            <div>
              <label className="block text-sm">Current password</label>
              <input
                name="currentPassword"
                type="password"
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">New password</label>
              <input
                name="newPassword"
                type="password"
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">
                Change password
              </button>
            </div>
          </form>
        </section>

        <section className="p-4 bg-white border rounded-md">
          <h3 className="font-medium">Change Email</h3>
          <form action={changeEmailAction} className="space-y-3 mt-2">
            <div>
              <label className="block text-sm">New email</label>
              <input
                name="newEmail"
                type="email"
                defaultValue={me?.email ?? ""}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">Current password</label>
              <input
                name="currentPasswordForEmail"
                type="password"
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded">
                Change email
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
