import { cn } from "@/shared/lib/utils";

export function PageHeader({ title, description, actions, meta, className }) {
  return (
    <header className={cn("border-b border-border pb-6", className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {meta ? (
            <p className="font-mono text-2xs text-muted-foreground">{meta}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
