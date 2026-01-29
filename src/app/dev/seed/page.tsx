"use client";
import { useState } from "react";

export default function SeedAdminPage() {
  const [status, setStatus] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  async function handleSeed() {
    setStatus("Seeding...");
    setOutput("");
    const res = await fetch("/api/dev/seed", {
      method: "POST",
      headers: { "x-seed-api-key": apiKey },
    });
    const data = await res.json();
    if (data.ok) {
      setStatus("Success!");
      setOutput(data.output);
    } else {
      setStatus("Error: " + (data.error || "Unknown error"));
      setOutput(data.output || "");
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Seed Database (Admin)</h1>
      <label htmlFor="api-key" className="block mb-2 font-semibold">
        API Key:
      </label>
      <input
        id="api-key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border px-2 py-1 mb-4 w-full"
        placeholder="Enter SEED_API_KEY"
        aria-required="true"
      />
      <button
        onClick={handleSeed}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={!apiKey || status === "Seeding..."}
      >
        {status === "Seeding..." ? "Seeding..." : "Run Seeder"}
      </button>
      {status && (
        <div className="mt-4" aria-live="polite" aria-atomic="true">
          <strong>Status:</strong> {status}
        </div>
      )}
      {output && (
        <pre
          className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto"
          aria-live="polite"
          aria-atomic="true"
        >
          {output}
        </pre>
      )}
    </main>
  );
}
