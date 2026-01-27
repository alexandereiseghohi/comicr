"use client";
import React, { useState } from "react";

type Props = {
  defaultName?: string | null;
  defaultImage?: string | null;
};

export default function ProfileForm({ defaultName, defaultImage }: Props) {
  const [name, setName] = useState(defaultName ?? "");
  const [image, setImage] = useState(defaultImage ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const json = await res.json();
      if (!json.success) {
        setMessage(json.error || "Update failed");
      } else {
        setMessage("Profile updated");
      }
    } catch (err) {
       
      console.error(err);
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
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

      {message && <div className="text-sm text-muted-foreground">{message}</div>}
    </form>
  );
}
