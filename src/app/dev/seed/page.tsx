"use client";
import { useCallback, useRef, useState } from "react";

interface SeedLog {
  type: string;
  phase?: string;
  count?: number;
  message?: string;
  error?: string;
  timestamp?: string;
}

type SeedStatus = "idle" | "running" | "success" | "error";

export default function SeedAdminPage() {
  const [status, setStatus] = useState<SeedStatus>("idle");
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [dryRun, setDryRun] = useState<boolean>(false);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((log: SeedLog) => {
    setLogs((prev) => [...prev, log]);
    if (log.phase) {
      setCurrentPhase(log.phase);
    }
    if (log.count !== undefined) {
      setProgress((prev) => ({
        current: (prev?.current ?? 0) + 1,
        total: Math.max(prev?.total ?? log.count ?? 0, log.count ?? 0),
      }));
    }
  }, []);

  const handleSeedStream = useCallback(async () => {
    setStatus("running");
    setLogs([]);
    setCurrentPhase("");
    setProgress(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/dev/seed?stream=true&dry=${dryRun}`, {
        method: "POST",
        headers: { "x-seed-api-key": apiKey },
        signal: controller.signal,
      });

      if (!res.ok) {
        const error = await res.json();
        setStatus("error");
        addLog({ type: "error", error: error.error || "Request failed" });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setStatus("error");
        addLog({ type: "error", error: "No response body" });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (\w+)/);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            try {
              const data = JSON.parse(dataMatch[1]);
              addLog({ type: eventType, ...data });

              if (eventType === "complete") {
                setStatus(data.success ? "success" : "error");
              }
            } catch {
              addLog({ type: "log", message: dataMatch[1] });
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        addLog({ type: "info", message: "Seeding cancelled by user" });
        setStatus("idle");
      } else {
        setStatus("error");
        addLog({ type: "error", error: (err as Error).message });
      }
    }
  }, [apiKey, dryRun, addLog]);

  const handleSeedNonStream = useCallback(async () => {
    setStatus("running");
    setLogs([]);
    setCurrentPhase("processing");
    setProgress(null);

    try {
      const res = await fetch("/api/dev/seed", {
        method: "POST",
        headers: {
          "x-seed-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dryRun }),
      });

      const data = await res.json();

      if (data.ok) {
        setStatus("success");
        if (data.logs) {
          data.logs.forEach((log: SeedLog) => addLog(log));
        }
        addLog({ type: "complete", message: "Seeding completed successfully" });
      } else {
        setStatus("error");
        addLog({ type: "error", error: data.error || "Unknown error" });
      }
    } catch (err) {
      setStatus("error");
      addLog({ type: "error", error: (err as Error).message });
    }
  }, [apiKey, dryRun, addLog]);

  const handleSeed = () => {
    if (useStreaming) {
      handleSeedStream();
    } else {
      handleSeedNonStream();
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-600";
      case "complete":
        return "text-green-600";
      case "progress":
        return "text-blue-600";
      case "start":
        return "text-purple-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Seed Database (Admin)</h1>

      {/* API Key Input */}
      <div className="mb-4">
        <label htmlFor="api-key" className="block mb-2 font-semibold">
          API Key:
        </label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border px-3 py-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter SEED_API_KEY"
          aria-required="true"
        />
      </div>

      {/* Options */}
      <div className="mb-4 flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Dry Run</span>
          <span className="text-xs text-gray-500">(validate without writing)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Real-time Progress</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleSeed}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!apiKey || status === "running"}
        >
          {status === "running" ? "Seeding..." : dryRun ? "Validate Data" : "Run Seeder"}
        </button>
        {status === "running" && useStreaming && (
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Status Display */}
      {status !== "idle" && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold ${getStatusColor()}`}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {currentPhase && (
              <span className="text-sm text-gray-600">
                Phase: <span className="font-medium">{currentPhase}</span>
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {status === "running" && progress && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min((progress.current / progress.total) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.current} / {progress.total} items processed
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Output */}
      {logs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold border-b flex justify-between items-center">
            <span>Logs ({logs.length})</span>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div
            className="max-h-96 overflow-y-auto p-4 bg-gray-900 text-sm font-mono"
            aria-live="polite"
            aria-atomic="false"
          >
            {logs.map((log, i) => (
              <div key={i} className={`py-1 ${getLogColor(log.type)}`}>
                <span className="text-gray-500">[{log.type}]</span>{" "}
                {log.phase && <span className="text-yellow-400">{log.phase}: </span>}
                {log.message && <span className="text-gray-300">{log.message}</span>}
                {log.count !== undefined && (
                  <span className="text-cyan-400">count={log.count}</span>
                )}
                {log.error && <span className="text-red-400">{log.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
        <p className="font-semibold text-blue-800 mb-2">Instructions:</p>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Enter your SEED_API_KEY from environment variables</li>
          <li>
            Enable <strong>Dry Run</strong> to validate data without database changes
          </li>
          <li>
            Enable <strong>Real-time Progress</strong> to see live updates
          </li>
          <li>Seeds: users, authors, artists, genres, types, comics, chapters</li>
        </ul>
      </div>
    </main>
  );
}
