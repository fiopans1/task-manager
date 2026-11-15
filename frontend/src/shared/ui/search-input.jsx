import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export const SearchInput = React.forwardRef(function SearchInput(
  { className, value, onChange, onClear, placeholder = "Search", ...props },
  ref,
) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={ref}
        type="text"
        inputMode="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label={props["aria-label"] ?? placeholder}
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Reset input"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

SearchInput.displayName = "SearchInput";
