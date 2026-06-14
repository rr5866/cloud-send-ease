import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  File as FileIcon,
  X,
  Loader2,
  Check,
  Copy,
  Wifi,
  Cloud,
  Ghost,
  Sparkles,
  Shield,
  Timer,
  Link2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GhostShare — Ephemeral file sharing" },
      { name: "description", content: "Share files securely over your local network or the global cloud. Auto-destruct after a set time or download limit." },
      { property: "og:title", content: "GhostShare — Ephemeral file sharing" },
      { property: "og:description", content: "Secure, self-destructing file links across LAN and cloud." },
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

  const handleFile = (f: File) => {
    setFile(f);
    toast.success("File selected", { description: `${f.name} • ${formatBytes(f.size)}` });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    // === Backend wiring template ===
    // const form = new FormData();
    // form.append("file", file);
    // form.append("mode", shareType);            // "local" | "cloud"
    // form.append("maxDownloads", String(maxDownloads));
    // form.append("expiry", expiry);             // "1h" | "24h" | "7d"
    // try {
    //   const res = await fetch("/api/upload", { method: "POST", body: form });
    //   if (!res.ok) throw new Error("Upload failed");
    //   const { id } = await res.json();
    //   setShareUrl(`${window.location.origin}/download/${id}`);
    // } catch (err) { toast.error("Upload failed"); }

    try {
      await new Promise((r) => setTimeout(r, 1400));
      const id = Math.random().toString(36).slice(2, 10);
      setShareUrl(`${window.location.origin}/download/${id}`);
      toast.success("Ghost link generated", { description: "Ready to share." });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
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
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb h-[420px] w-[420px] -top-20 -left-20" style={{ background: "oklch(0.55 0.28 295)" }} />
      <div className="orb h-[380px] w-[380px] bottom-0 right-0" style={{ background: "oklch(0.55 0.25 250)", animationDelay: "3s" }} />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Ghost className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
          <span className="text-base">GhostShare</span>
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Ephemeral · End-to-end ready
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl animate-fade-in">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              Self-destructing transfers
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Send like a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ghost
              </span>
              .
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Files vanish after they're opened — or when time runs out.
            </p>
          </div>

          <div className="relative rounded-2xl glass-card p-6 sm:p-8">
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
                    "group cursor-pointer rounded-xl border-2 border-dashed transition-all",
                    "px-6 py-10 text-center",
                    dragging
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : "border-border hover:border-primary/60 hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  {file ? (
                    <div className="flex items-center justify-between gap-3 text-left animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary ring-1 ring-primary/30">
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
                        className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition">
                        <UploadCloud className="h-7 w-7 text-primary" />
                      </span>
                      <p className="mt-4 text-sm font-medium">
                        Drop a file here, or <span className="text-primary">browse</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Single file · Any type · Up to 2GB</p>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>

                {/* Network toggle */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Transfer Mode
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] border border-border p-1">
                    <ToggleOption
                      active={shareType === "local"}
                      onClick={() => setShareType("local")}
                      icon={<Wifi className="h-4 w-4" />}
                      title="Local Network"
                      subtitle="Direct LAN stream"
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

                {/* Security */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Max Downloads" icon={<Shield className="h-3 w-3" />}>
                    <input
                      type="number"
                      min={1}
                      value={maxDownloads}
                      onChange={(e) =>
                        setMaxDownloads(Math.max(1, parseInt(e.target.value || "1", 10)))
                      }
                      className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </Field>
                  <Field label="Auto-Destruct" icon={<Timer className="h-3 w-3" />}>
                    <select
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value as Expiry)}
                      className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition"
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
                  className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Ghost Link…
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Generate Ghost Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Wire to your Node + Multer + Cloudinary backend via <code className="rounded bg-white/5 px-1.5 py-0.5 text-[10.5px]">POST /api/upload</code>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
        active
          ? "bg-gradient-to-br from-primary/20 to-accent/10 text-foreground ring-1 ring-primary/40 shadow-glow"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
          active ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-white/5",
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
    <div className="text-center py-2 animate-fade-in">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-success/30 to-primary/20 text-success ring-1 ring-success/40">
        <Check className="h-8 w-8" strokeWidth={2.5} />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your Ghost Link is live</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Share it anywhere. It self-destructs on your terms.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] p-1.5">
        <span className="pl-2 text-muted-foreground">
          <Link2 className="h-4 w-4" />
        </span>
        <input
          readOnly
          value={url}
          className="flex-1 bg-transparent px-1 py-2 text-sm outline-none truncate"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-3.5 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <button
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-white/5 transition"
      >
        <Ghost className="h-4 w-4" />
        Share Another File
      </button>
    </div>
  );
}
