import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileDown, Wifi, Cloud, AlertTriangle, Ghost, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/download/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Download — GhostShare` },
      { name: "description", content: "Securely download a file shared via GhostShare. Self-destructs after the download limit." },
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

function DownloadPage() {
  const { id } = Route.useParams();
  const meta = useFileMeta(id);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    // Replace with: window.location.href = `/api/files/${id}/download`;
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Download started", { description: meta.filename });
    setDownloading(false);
  };

  const isLocal = meta.shareType === "local";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="orb h-[400px] w-[400px] -top-20 -right-20" style={{ background: "oklch(0.55 0.28 295)" }} />
      <div className="orb h-[360px] w-[360px] bottom-0 -left-10" style={{ background: "oklch(0.55 0.25 250)", animationDelay: "2s" }} />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Ghost className="h-4.5 w-4.5" strokeWidth={2.4} />
          </span>
          <span>GhostShare</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl glass-card p-8 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-1 ring-primary/40 shadow-glow">
              <FileDown className="h-8 w-8" />
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

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing secure stream…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Secure Download
                </>
              )}
            </button>

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
