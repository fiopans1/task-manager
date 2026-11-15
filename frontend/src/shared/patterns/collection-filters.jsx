import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

/**
 * Compact filter controls designed to sit inside `SearchToolbar`.
 *
 * Each field is `{ key, label, value, options, onChange, active }`. `active`
 * marks a field as narrowed so the clear action only appears when useful.
 */
export function CollectionFilters({ fields = [], onClear, className }) {
  const active = fields.some((field) => field.active);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {fields.map((field) => (
        <label
          key={field.key}
          className="flex items-center gap-2 text-2xs font-medium text-muted-foreground"
        >
          <span className="whitespace-nowrap">{field.label}</span>
          <Select
            id={`filter-${field.key}`}
            name={`filter-${field.key}`}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            aria-label={`Filter by ${field.label.toLowerCase()}`}
            className="h-9 w-auto min-w-[9rem] pr-8 text-xs md:h-8"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      ))}
      {active ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
