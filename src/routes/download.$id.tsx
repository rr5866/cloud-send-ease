import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileDown, Wifi, Cloud, AlertTriangle, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/download/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Download ${params.id} — GhostShare` },
      { name: "description", content: "Download a file shared via GhostShare." },
    ],
  }),
  component: DownloadPage,
});

// Mock data — wire to backend GET /api/files/:id
function useFileMeta(id: string) {
  // deterministic mock so refresh stays stable
  const isLocal = id.charCodeAt(0) % 2 === 0;
  return {
    filename: "design-handoff-v3.zip",
    size: 24_117_248, // 23 MB
    shareType: (isLocal ? "local" : "cloud") as "local" | "cloud",
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
    // Replace with: window.location.href = `/api/files/${id}/download`
    await new Promise((r) => setTimeout(r, 900));
    setDownloading(false);
  };

  const isLocal = meta.shareType === "local";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </span>
          <span>GhostShare</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card backdrop-blur-xl shadow-card p-7 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <FileDown className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-semibold tracking-tight truncate">{meta.filename}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatBytes(meta.size)}</p>

            <div className="mt-4 flex justify-center">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
                  isLocal
                    ? "bg-success/10 text-success ring-success/30"
                    : "bg-primary/10 text-primary ring-primary/30",
                ].join(" ")}
              >
                {isLocal ? <Wifi className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
                {isLocal ? "Local Network" : "Cloud Storage"}
              </span>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download File"}
            </button>

            <p className="mt-5 inline-flex items-start gap-2 text-xs text-muted-foreground text-left">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              This link will expire soon or after the maximum download limit is reached.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
