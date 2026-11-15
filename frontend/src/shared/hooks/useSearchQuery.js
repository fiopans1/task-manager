import { useCallback, useState } from "react";

/**
 * Search state shared by every collection page.
 *
 * `searchTerm` is the controlled input value. `activeSearchTerm` is the value
 * that has actually been submitted, so typing does not trigger requests on
 * every keystroke. `refreshKey` is the single dependency feature hooks pass to
 * their data loaders.
 */
export function useSearchQuery(initialValue = "") {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [activeSearchTerm, setActiveSearchTerm] = useState(initialValue);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const submit = useCallback(
    (event) => {
      event?.preventDefault();
      setActiveSearchTerm(searchTerm.trim());
      refresh();
    },
    [searchTerm, refresh],
  );

  const clear = useCallback(() => {
    setSearchTerm("");
    setActiveSearchTerm("");
    refresh();
  }, [refresh]);

  return {
    searchTerm,
    setSearchTerm,
    activeSearchTerm,
    hasActiveSearch: activeSearchTerm.trim().length > 0,
    submit,
    clear,
    refreshKey,
    refresh,
  };
}
