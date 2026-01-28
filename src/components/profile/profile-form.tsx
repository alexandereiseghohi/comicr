"use client";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  defaultName?: string | null;
  defaultImage?: string | null;
  defaultEmail?: string | null;
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
    const currentPassword = (form.elements.namedItem("currentPasswordForEmail") as HTMLInputElement)
      .value;
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
      <form onSubmit={onSubmit} className="p-4 bg-white border rounded-md space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm">Image URL</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <a href="/profile" className="text-sm text-muted-foreground">
            Cancel
          </a>
        </div>
      </form>

      <form onSubmit={changePassword} className="p-4 bg-white border rounded-md space-y-3">
        <h3 className="text-lg font-medium">Change password</h3>
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
          <button
            type="submit"
            disabled={pwLoading}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {pwLoading ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>

      <form onSubmit={changeEmail} className="p-4 bg-white border rounded-md space-y-3">
        <h3 className="text-lg font-medium">Change email</h3>
        <div>
          <label className="block text-sm">New email</label>
          <input
            name="newEmail"
            type="email"
            defaultValue={email}
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
          <button
            type="submit"
            disabled={emailLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            {emailLoading ? "Updating..." : "Change email"}
          </button>
        </div>
      </form>
    </div>
  );
}
