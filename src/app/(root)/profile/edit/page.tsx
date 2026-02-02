    "use server"
import { redirect } from "next/navigation";

import ProfileForm from "@/components/profile/profile-form";
import { updateUserById } from "@/database/mutations/user.mutations";
import { auth } from "@/lib/auth-config";

export default async function EditProfilePage() {
  const session = await auth();
  const me = session?.user;

  if (!me) redirect("/sign-in");

  // Server action to update profile (non-JS fallback)
  async function updateProfileAction(form: FormData) {
    const name = form.get("name") as null | string;
    const image = form.get("image") as null | string;
    if (!me?.id) return;
    await updateUserById(me.id, { name: name ?? null, image: image ?? null });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>

      {/* Client-side form (handles profile, password, and email changes via API) */}
      <div>
        <ProfileForm
          defaultEmail={me?.email ?? ""}
          defaultImage={(me as { image?: string })?.image ?? ""}
          defaultName={me?.name ?? ""}
        />
      </div>

      {/* Non-JS fallback for basic profile update only */}
      <noscript>
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="mb-4 text-sm text-amber-800">
            JavaScript is disabled. You can still update your basic profile information below. For password and email
            changes, please enable JavaScript.
          </p>
          <form action={updateProfileAction} className="space-y-3 rounded-md border bg-white p-4">
            <div>
              <label className="block text-sm">Name</label>
              <input className="mt-1 block w-full rounded border px-3 py-2" defaultValue={me?.name ?? ""} name="name" />
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
      </noscript>
    </div>
  );
}
