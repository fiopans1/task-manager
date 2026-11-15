import { Link } from "react-router-dom";
import configService from "@/services/configService";
import { Badge } from "@/shared/ui/badge";
import { ThemeToggleButton } from "@/shared/theme/ThemeToggleButton";
import { SystemMessageDialog } from "@/features/system-messages";
import { ShieldCheck } from "@/shared/lib/icons";

const COPYRIGHT = "© 2025 TaskManager · Created by fiopans1";

function MiniLedger() {
  const rows = [
    { title: "Review launch notes", state: "In progress", time: "00:42:18", tone: "brand" },
    { title: "Ship the release", state: "High", time: "Today", tone: "warning" },
    { title: "Write the changelog", state: "Done", time: "00:18:04", tone: "success" },
  ];

  return (
    <div
      aria-hidden="true"
      data-testid="auth-preview"
      className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-overlay"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-2xs text-muted-foreground">Thu · 10 Nov</p>
          <p className="text-sm font-semibold text-foreground">Today</p>
        </div>
        <Badge tone="brand">3 tasks</Badge>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.title} className="flex items-center gap-3 px-4 py-3">
            <span
              className={`h-7 w-0.5 rounded-full ${
                row.tone === "brand"
                  ? "bg-brand"
                  : row.tone === "warning"
                    ? "bg-warning"
                    : "bg-success"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{row.title}</p>
              <p className="text-2xs text-muted-foreground">{row.state}</p>
            </div>
            <span className="font-mono text-2xs tabular-nums text-muted-foreground">
              {row.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthLayout({
  title,
  description,
  children,
  footer,
  preview = true,
  showSystemMessage = false,
}) {
  const appName = configService.getAppName();

  return (
    <div className="relative isolate grid min-h-dvh overflow-hidden bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-[0.3] lg:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />

      <aside className="relative hidden overflow-hidden border-r border-border bg-surface-2 px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
          >
            <img src="/favicon.png" alt="" width={30} height={30} className="size-[30px]" />
            {appName}
          </Link>

          <div className="mt-16 max-w-md">
            <p className="font-mono text-2xs text-muted-foreground">Self-hosted workspace</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground">
              Your work, in order.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tasks, lists, calendar and time tracking in one precise place. No
              noise, no tab hunting.
            </p>
          </div>

          {preview ? (
            <div className="mt-10">
              <MiniLedger />
            </div>
          ) : null}
        </div>

        <div
          data-testid="auth-footer-desktop"
          className="relative flex items-center justify-between gap-4 font-mono text-2xs text-muted-foreground"
        >
          <span>{COPYRIGHT}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" />
            <span>v{configService.getAppVersion()} · Private by default</span>
          </span>
        </div>
      </aside>

      <main className="relative flex flex-col px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-safe sm:px-8 lg:justify-center lg:px-12 lg:py-10">
        <div className="mx-auto flex w-full max-w-md items-center gap-2.5 py-4 lg:hidden">
          <img src="/favicon.png" alt="" width={30} height={30} className="size-[30px]" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              {appName}
            </span>
            <span className="block font-mono text-2xs text-ink-faint">
              Self-hosted workspace
            </span>
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 lg:flex-none lg:justify-start lg:py-0">
          <div className="mb-7">
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {children}

          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>

        <div
          data-testid="auth-footer-mobile"
          className="mx-auto flex w-full max-w-md flex-col gap-1 pr-20 font-mono text-2xs text-muted-foreground lg:hidden"
        >
          <span className="leading-4">{COPYRIGHT}</span>
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-ink-faint">
            <span>
              v{configService.getAppVersion()} · {configService.getAppLicense()}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <ShieldCheck size={11} aria-hidden="true" />
              Private
            </span>
          </span>
        </div>
      </main>

      <ThemeToggleButton />
      {showSystemMessage ? <SystemMessageDialog context="beforeLogin" /> : null}
    </div>
  );
}
