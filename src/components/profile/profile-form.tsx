"use client";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  defaultEmail?: null | string;
  defaultImage?: null | string;
  defaultName?: null | string;
};

export default function ProfileForm({ defaultName, defaultImage, defaultEmail }: Props) {
  const [name, setName] = useState(defaultName ?? "");
  const [image, setImage] = useState(defaultImage ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Update failed");
      } else {
        toast.success("Profile updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    setPwLoading(true);

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Password change failed");
      } else {
        toast.success("Password changed");
        form.reset();
      }
    } catch (err) {
      console.error(err);
      toast.error("Request failed");
    } finally {
      setPwLoading(false);
    }
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newEmail = (form.elements.namedItem("newEmail") as HTMLInputElement).value;
    const currentPassword = (form.elements.namedItem("currentPasswordForEmail") as HTMLInputElement).value;
    setEmailLoading(true);

    try {
      const res = await fetch("/api/profile/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, currentPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Email change failed");
      } else {
        toast.success("Email changed");
        setEmail(newEmail);
        form.reset();
      }
    } catch (err) {
      console.error(err);
      toast.error("Request failed");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="space-y-3 rounded-md border bg-white p-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm">Name</label>
          <input
            className="mt-1 block w-full rounded border px-3 py-2"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div>
          <label className="block text-sm" htmlFor="profile-image-url">
            Image URL
          </label>
          <input
            aria-describedby="profile-image-preview"
            className="mt-1 block w-full rounded border px-3 py-2"
            id="profile-image-url"
            onChange={(e) => setImage(e.target.value)}
            value={image}
          />
          <div className="mt-2 flex items-center gap-4">
            <Image
              alt={name ? `Profile image for ${name}` : "Profile image"}
              className="h-16 w-16 rounded-full border object-cover"
              height={64}
              id="profile-image-preview"
              onError={undefined}
              src={image && image.trim() ? image : "/images/shadcn.jpg"}
              width={64}
            />
            <span className="text-muted-foreground text-xs">Preview</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="rounded bg-blue-600 px-4 py-2 text-white" disabled={loading} type="submit">
            {loading ? "Saving..." : "Save"}
          </button>
          <a className="text-muted-foreground text-sm" href="/profile">
            Cancel
          </a>
        </div>
      </form>

      <form className="space-y-3 rounded-md border bg-white p-4" onSubmit={changePassword}>
        <h3 className="text-lg font-medium">Change password</h3>
        <div>
          <label className="block text-sm">Current password</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" name="currentPassword" type="password" />
        </div>
        <div>
          <label className="block text-sm">New password</label>
          <input className="mt-1 block w-full rounded border px-3 py-2" name="newPassword" type="password" />
        </div>
        <div>
          <button className="rounded bg-red-600 px-4 py-2 text-white" disabled={pwLoading} type="submit">
            {pwLoading ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>

      <form className="space-y-3 rounded-md border bg-white p-4" onSubmit={changeEmail}>
        <h3 className="text-lg font-medium">Change email</h3>
        <div>
          <label className="block text-sm">New email</label>
          <input
            className="mt-1 block w-full rounded border px-3 py-2"
            defaultValue={email}
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
          <button className="rounded bg-yellow-600 px-4 py-2 text-white" disabled={emailLoading} type="submit">
            {emailLoading ? "Updating..." : "Change email"}
          </button>
        </div>
      </form>
    </div>
  );
}
