import { cn } from "@/shared/lib/utils";

export function Field({ label, htmlFor, hint, error, errorId, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-xs font-medium text-foreground"
        >
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title ? (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          ) : null}
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function FormGrid({ columns = 2, children, className }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
