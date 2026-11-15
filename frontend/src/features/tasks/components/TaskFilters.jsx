import { CollectionFilters } from "@/shared/patterns/collection-filters";
import { PRIORITY_META } from "@/shared/ui/status-badge";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PAUSSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "MIN"].map(
  (value) => ({ value, label: PRIORITY_META[value].label }),
);

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "Priority" },
  { value: "name", label: "Name" },
];

export const DEFAULT_TASK_FILTERS = {
  status: "ALL",
  priority: "ALL",
  sort: "newest",
};

export function TaskFilters({ value, onChange, onClear }) {
  const update = (key) => (next) => onChange({ ...value, [key]: next });

  return (
    <CollectionFilters
      onClear={onClear}
      fields={[
        {
          key: "task-status",
          label: "Status",
          value: value.status,
          active: value.status !== "ALL",
          options: [{ value: "ALL", label: "All statuses" }, ...STATUS_OPTIONS],
          onChange: update("status"),
        },
        {
          key: "task-priority",
          label: "Priority",
          value: value.priority,
          active: value.priority !== "ALL",
          options: [{ value: "ALL", label: "All priorities" }, ...PRIORITY_OPTIONS],
          onChange: update("priority"),
        },
        {
          key: "task-sort",
          label: "Sort",
          value: value.sort,
          active: value.sort !== "newest",
          options: SORT_OPTIONS,
          onChange: update("sort"),
        },
      ]}
    />
  );
}
