import { CollectionFilters } from "@/shared/patterns/collection-filters";

const PROGRESS_OPTIONS = [
  { value: "ALL", label: "All lists" },
  { value: "EMPTY", label: "Empty" },
  { value: "ACTIVE", label: "In progress" },
  { value: "COMPLETE", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name" },
  { value: "progress", label: "Progress" },
];

export const DEFAULT_LIST_FILTERS = {
  progress: "ALL",
  sort: "newest",
};

export function ListFilters({ value, onChange, onClear }) {
  const update = (key) => (next) => onChange({ ...value, [key]: next });

  return (
    <CollectionFilters
      onClear={onClear}
      fields={[
        {
          key: "list-progress",
          label: "Progress",
          value: value.progress,
          active: value.progress !== "ALL",
          options: PROGRESS_OPTIONS,
          onChange: update("progress"),
        },
        {
          key: "list-sort",
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
