import { CollectionFilters } from "@/shared/patterns/collection-filters";

const SIZE_OPTIONS = [
  { value: "ALL", label: "All teams" },
  { value: "SOLO", label: "Just me" },
  { value: "SMALL", label: "2–4 members" },
  { value: "LARGE", label: "5+ members" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name" },
  { value: "members", label: "Most members" },
];

export const DEFAULT_TEAM_FILTERS = {
  size: "ALL",
  sort: "newest",
};

export function TeamFilters({ value, onChange, onClear }) {
  const update = (key) => (next) => onChange({ ...value, [key]: next });

  return (
    <CollectionFilters
      onClear={onClear}
      fields={[
        {
          key: "team-size",
          label: "Size",
          value: value.size,
          active: value.size !== "ALL",
          options: SIZE_OPTIONS,
          onChange: update("size"),
        },
        {
          key: "team-sort",
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
