import { useCallback, useRef, useState } from "react";

("use client");

interface SeedLog {
  count?: number;
  error?: string;
  message?: string;
  phase?: string;
  timestamp?: string;
  type: string;
}

type SeedStatus = "error" | "idle" | "running" | "success";

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
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Seed Database (Admin)</h1>

      {/* API Key Input */}
      <div className="mb-4">
        <label className="mb-2 block font-semibold" htmlFor="api-key">
          API Key:
        </label>
        <input
          aria-required="true"
          className="w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          id="api-key"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter SEED_API_KEY"
          type="password"
          value={apiKey}
        />
      </div>

      {/* Options */}
      <div className="mb-4 flex gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={dryRun}
            className="h-4 w-4 rounded"
            onChange={(e) => setDryRun(e.target.checked)}
            type="checkbox"
          />
          <span className="text-sm">Dry Run</span>
          <span className="text-xs text-gray-500">(validate without writing)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={useStreaming}
            className="h-4 w-4 rounded"
            onChange={(e) => setUseStreaming(e.target.checked)}
            type="checkbox"
          />
          <span className="text-sm">Real-time Progress</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!apiKey || status === "running"}
          onClick={handleSeed}
        >
          {status === "running" ? "Seeding..." : dryRun ? "Validate Data" : "Run Seeder"}
        </button>
        {status === "running" && useStreaming && (
          <button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>

      {/* Status Display */}
      {status !== "idle" && (
        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
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
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min((progress.current / progress.total) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {progress.current} / {progress.total} items processed
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Output */}
      {logs.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b bg-gray-100 px-4 py-2 font-semibold">
            <span>Logs ({logs.length})</span>
            <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setLogs([])}>
              Clear
            </button>
          </div>
          <div
            aria-atomic="false"
            aria-live="polite"
            className="max-h-96 overflow-y-auto bg-gray-900 p-4 font-mono text-sm"
          >
            {logs.map((log, i) => (
              <div className={`py-1 ${getLogColor(log.type)}`} key={i}>
                <span className="text-gray-500">[{log.type}]</span>{" "}
                {log.phase && <span className="text-yellow-400">{log.phase}: </span>}
                {log.message && <span className="text-gray-300">{log.message}</span>}
                {log.count !== undefined && <span className="text-cyan-400">count={log.count}</span>}
                {log.error && <span className="text-red-400">{log.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
        <p className="mb-2 font-semibold text-blue-800">Instructions:</p>
        <ul className="list-inside list-disc space-y-1 text-blue-700">
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
