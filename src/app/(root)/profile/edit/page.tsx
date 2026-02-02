import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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

export default async function EditProfilePage() {
  const session = await auth();
  const me = session?.user;

  if (!me) redirect("/sign-in");

  // Server action to update profile (non-JS fallback)
  async function updateProfileAction(form: FormData) {
    "use server";
    const name = form.get("name") as null | string;
    const image = form.get("image") as null | string;
    if (!me?.id) return;
    await updateUserById(me.id, { name: name ?? null, image: image ?? null });
  }

  // Server action to change password
  async function changePasswordAction(form: FormData) {
    "use server";
    const currentPassword = form.get("currentPassword") as null | string;
    const newPassword = form.get("newPassword") as null | string;
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
    const currentPassword = form.get("currentPasswordForEmail") as null | string;
    const newEmail = form.get("newEmail") as null | string;
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
          defaultImage={(me as { image?: string })?.image ?? ""}
          defaultName={me?.name ?? ""}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium">Server (non-JS) form</h2>
        <form action={updateProfileAction} className="space-y-3 rounded-md border bg-white p-4">
          <div>
            <label className="block text-sm">Name</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              defaultValue={me?.name ?? ""}
              name="name"
            />
          </div>
          <div>
            <label className="block text-sm">Image URL</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              defaultValue={(me as { image?: string })?.image ?? ""}
              name="image"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">
              Save
            </button>
            <a className="text-muted-foreground text-sm" href="/profile">
              Cancel
            </a>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-md border bg-white p-4">
          <h3 className="font-medium">Change Password</h3>
          <form action={changePasswordAction} className="mt-2 space-y-3">
            <div>
              <label className="block text-sm">Current password</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2"
                name="currentPassword"
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm">New password</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2"
                name="newPassword"
                type="password"
              />
            </div>
            <div>
              <button className="rounded bg-red-600 px-4 py-2 text-white" type="submit">
                Change password
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-md border bg-white p-4">
          <h3 className="font-medium">Change Email</h3>
          <form action={changeEmailAction} className="mt-2 space-y-3">
            <div>
              <label className="block text-sm">New email</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2"
                defaultValue={me?.email ?? ""}
                name="newEmail"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm">Current password</label>
              <input
                className="mt-1 block w-full rounded border px-3 py-2"
                name="currentPasswordForEmail"
                type="password"
              />
            </div>
            <div>
              <button className="rounded bg-yellow-600 px-4 py-2 text-white" type="submit">
                Change email
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
