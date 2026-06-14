import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  File as FileIcon,
  X,
  Loader2,
  Check,
  Copy,
  Wifi,
  Cloud,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GhostShare — Send files, anywhere" },
      { name: "description", content: "Share files instantly over your local network or the global cloud. Set expiration and download limits." },
      { property: "og:title", content: "GhostShare — Send files, anywhere" },
      { property: "og:description", content: "Share files instantly with expiring, limited-download links." },
    ],
  }),
  component: Index,
});

type ShareType = "local" | "cloud";
type Expiry = "1h" | "24h" | "7d";

const EXPIRY_OPTIONS: { value: Expiry; label: string }[] = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [shareType, setShareType] = useState<ShareType>("local");
  const [maxDownloads, setMaxDownloads] = useState<number>(1);
  const [expiry, setExpiry] = useState<Expiry>("24h");
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    // Simulated upload — wire to backend (Multer/Cloudinary) here.
    await new Promise((r) => setTimeout(r, 1400));
    const id = Math.random().toString(36).slice(2, 10);
    const url = `${window.location.origin}/download/${id}`;
    setShareUrl(url);
    setUploading(false);
  };

  const reset = () => {
    setFile(null);
    setShareUrl(null);
    setCopied(false);
    setMaxDownloads(1);
    setExpiry("24h");
    setShareType("local");
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </span>
          <span>Driftsend</span>
        </Link>
        <span className="text-xs text-muted-foreground hidden sm:block">
          Frontend demo — connect to your Node + Multer + Cloudinary backend
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Send files, your way.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Fast over your local network, or anywhere via the cloud.
            </p>
          </div>

          <div className="relative rounded-2xl border border-border bg-card backdrop-blur-xl shadow-card p-6 sm:p-8">
            {shareUrl ? (
              <SuccessState
                url={shareUrl}
                copied={copied}
                onCopy={copyLink}
                onReset={reset}
              />
            ) : (
              <div className="space-y-6">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={[
                    "group cursor-pointer rounded-xl border-2 border-dashed transition-colors",
                    "px-6 py-10 text-center",
                    dragging
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/60 hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  {file ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <FileIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="mt-3 text-sm font-medium">
                        Drop a file here, or <span className="text-primary">browse</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Single file. Any type.</p>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                  />
                </div>

                {/* Network toggle */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Destination
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-1">
                    <ToggleOption
                      active={shareType === "local"}
                      onClick={() => setShareType("local")}
                      icon={<Wifi className="h-4 w-4" />}
                      title="Local Network"
                      subtitle="Fast, direct"
                    />
                    <ToggleOption
                      active={shareType === "cloud"}
                      onClick={() => setShareType("cloud")}
                      icon={<Cloud className="h-4 w-4" />}
                      title="Global Cloud"
                      subtitle="Cloudinary, anywhere"
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Max Downloads">
                    <input
                      type="number"
                      min={1}
                      value={maxDownloads}
                      onChange={(e) =>
                        setMaxDownloads(Math.max(1, parseInt(e.target.value || "1", 10)))
                      }
                      className="w-full rounded-lg bg-input/60 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                  <Field label="Expires In">
                    <select
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value as Expiry)}
                      className="w-full rounded-lg bg-input/60 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                    >
                      {EXPIRY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-popover">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Upload & Generate Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
        active
          ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-white/5",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function SuccessState({
  url,
  copied,
  onCopy,
  onReset,
}: {
  url: string;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
}) {
  return (
    <div className="text-center py-2">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/30">
        <Check className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">Your file is ready to share</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Send this link to anyone — it'll expire based on your settings.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] p-2">
        <input
          readOnly
          value={url}
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>

      <button
        onClick={onReset}
        className="mt-5 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
      >
        Send another file
      </button>
    </div>
  );
}
