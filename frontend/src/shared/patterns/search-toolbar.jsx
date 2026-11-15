import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import { cn } from "@/shared/lib/utils";

export function SearchToolbar({
  searchTerm,
  onSearchTermChange,
  onSubmit,
  onClear,
  onRefresh,
  placeholder = "Search",
  actions,
  filters,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={onSubmit}
          className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
          role="search"
        >
          <SearchInput
            value={searchTerm}
            onChange={onSearchTermChange}
            onClear={onClear}
            placeholder={placeholder}
            className="w-full sm:max-w-md"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm">
              Search
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            {onRefresh ? (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={onRefresh}
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw size={15} aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </form>
        {actions || children ? (
          <div className="flex flex-wrap items-center gap-2">
            {children}
            {actions}
          </div>
        ) : null}
      </div>

      {filters ? (
        <div className="mt-3 border-t border-border pt-3">{filters}</div>
      ) : null}
    </div>
  );
}
