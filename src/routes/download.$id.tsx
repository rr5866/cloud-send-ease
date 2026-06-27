import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  FileDown,
  Wifi,
  Cloud,
  AlertTriangle,
  Ghost,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/download/$id")({
  head: () => ({
    meta: [
      { title: `Download — GhostShare` },
      {
        name: "description",
        content:
          "Securely download a file shared via GhostShare. Self-destructs after the download limit.",
      },
    ],
  }),
  component: DownloadPage,
});

// Mock — replace with: GET /api/files/:id
function useFileMeta(id: string) {
  const isLocal = id.charCodeAt(0) % 2 === 0;
  return {
    filename: "design-handoff-v3.zip",
    size: 24_117_248,
    shareType: (isLocal ? "local" : "cloud") as "local" | "cloud",
    downloadsLeft: 1,
  };
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

type Status = "idle" | "preparing" | "downloading" | "done" | "error";

function DownloadPage() {
  const { id } = Route.useParams();
  const meta = useFileMeta(id);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const startDownload = () => {
    setStatus("preparing");
    setProgress(0);
    setError(null);

    // Simulate handshake → streaming → completion (or random failure).
    const prep = setTimeout(() => {
      setStatus("downloading");
      let p = 0;
      const tick = () => {
        // variable chunk size for realism
        p += Math.random() * 9 + 3;
        if (p >= 100) {
          setProgress(100);
          // 12% chance of simulated failure near the end for demo
          if (Math.random() < 0.12) {
            setStatus("error");
            setError("Connection interrupted. The stream was closed before completion.");
            toast.error("Download failed", { description: "Connection interrupted." });
            return;
          }
          setStatus("done");
          toast.success("Download complete", { description: meta.filename });
          return;
        }
        setProgress(p);
        const t = setTimeout(tick, 180 + Math.random() * 220);
        timers.current.push(t);
      };
      tick();
    }, 700);
    timers.current.push(prep);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStatus("idle");
    setProgress(0);
    setError(null);
  };

  const cancel = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStatus("idle");
    setProgress(0);
    setError(null);
    toast("Download canceled", { description: "The transfer was stopped." });
  };

  const isLocal = meta.shareType === "local";
  const busy = status === "preparing" || status === "downloading";
  const transferred = Math.min(meta.size, Math.round((progress / 100) * meta.size));

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div
        className="orb h-[400px] w-[400px] -top-20 -right-20"
        style={{ background: "oklch(0.55 0.28 295)" }}
      />
      <div
        className="orb h-[360px] w-[360px] bottom-0 -left-10"
        style={{ background: "oklch(0.55 0.25 250)", animationDelay: "2s" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Ghost className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
          <span>GhostShare</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl glass-card p-8 text-center">
            <div
              className={[
                "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl ring-1 shadow-glow transition-colors",
                status === "done"
                  ? "bg-gradient-to-br from-success/30 to-primary/20 text-success ring-success/40"
                  : status === "error"
                  ? "bg-gradient-to-br from-destructive/30 to-destructive/10 text-destructive ring-destructive/40"
                  : "bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-primary/40",
              ].join(" ")}
            >
              {status === "done" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : status === "error" ? (
                <XCircle className="h-8 w-8" />
              ) : (
                <FileDown className="h-8 w-8" />
              )}
            </div>

            <h1 className="mt-5 text-xl font-semibold tracking-tight truncate" title={meta.filename}>
              {meta.filename}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatBytes(meta.size)}</p>

            <div className="mt-4 flex justify-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
                  isLocal
                    ? "bg-success/10 text-success ring-success/30"
                    : "bg-primary/10 text-primary ring-primary/30",
                ].join(" ")}
              >
                {isLocal ? <Wifi className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
                {isLocal ? "Local Direct Stream" : "Cloud Download"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>

            {/* Progress / status panel */}
            {(busy || status === "done" || status === "error") && (
              <div className="mt-6 text-left animate-fade-in">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span
                    className={[
                      "inline-flex items-center gap-1.5",
                      status === "error"
                        ? "text-destructive"
                        : status === "done"
                        ? "text-success"
                        : "text-foreground/80",
                    ].join(" ")}
                  >
                    {status === "preparing" && (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Establishing secure stream…
                      </>
                    )}
                    {status === "downloading" && (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Downloading…
                      </>
                    )}
                    {status === "done" && (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Transfer complete
                      </>
                    )}
                    {status === "error" && (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Transfer failed
                      </>
                    )}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {Math.floor(progress)}%
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-border">
                  <div
                    className={[
                      "h-full rounded-full transition-[width] duration-200 ease-out",
                      status === "error"
                        ? "bg-destructive"
                        : status === "done"
                        ? "bg-gradient-to-r from-success to-primary"
                        : "bg-gradient-to-r from-primary to-accent",
                    ].join(" ")}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                  <span>
                    {formatBytes(transferred)} / {formatBytes(meta.size)}
                  </span>
                  <span>
                    {status === "downloading" && "streaming"}
                    {status === "preparing" && "handshake"}
                    {status === "done" && "saved"}
                    {status === "error" && "aborted"}
                  </span>
                </div>

                {status === "error" && error && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                    <p className="text-xs text-destructive leading-relaxed">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            {status === "idle" && (
              <button
                onClick={startDownload}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="h-4 w-4" />
                Secure Download
              </button>
            )}

            {busy && (
              <div className="mt-7 flex gap-2">
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/60 to-accent/60 px-5 py-3.5 text-sm font-semibold text-primary-foreground opacity-80 cursor-not-allowed"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status === "preparing" ? "Preparing…" : "Downloading…"}
                </button>
                <button
                  onClick={cancel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition"
                  aria-label="Cancel download"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}

            {status === "error" && (
              <button
                onClick={startDownload}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]"
              >
                <RotateCcw className="h-4 w-4" />
                Retry Download
              </button>
            )}

            {status === "done" && (
              <button
                onClick={reset}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-white/[0.06] transition"
              >
                <Download className="h-4 w-4" />
                Download Again
              </button>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-white/[0.02] p-3 text-left">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This file will self-destruct after the download limit is reached.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Powered by GhostShare · ID <span className="font-mono text-foreground/70">{id}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
