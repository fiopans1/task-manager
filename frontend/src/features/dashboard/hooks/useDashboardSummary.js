import { useCallback, useEffect, useState } from "react";
import homeService from "@/services/homeService";

export function useDashboardSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    homeService
      .getHomeSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  return { summary, loading, error, reload };
}
