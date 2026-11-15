import * as React from "react";
import { cn } from "@/shared/lib/utils";

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
});

Table.displayName = "Table";

const TableHeader = React.forwardRef(function TableHeader(
  { className, ...props },
  ref,
) {
  return (
    <thead
      ref={ref}
      className={cn("border-b border-border bg-surface-2/60", className)}
      {...props}
    />
  );
});

TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(function TableBody(
  { className, ...props },
  ref,
) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
});

TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(function TableRow(
  { className, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors hover:bg-surface-2/60",
        className,
      )}
      {...props}
    />
  );
});

TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(function TableHead(
  { className, ...props },
  ref,
) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-3 text-left align-middle text-2xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(function TableCell(
  { className, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={cn("px-3 py-3 align-middle text-sm text-foreground", className)}
      {...props}
    />
  );
});

TableCell.displayName = "TableCell";

function TableCaption({ className, ...props }) {
  return (
    <caption
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};
