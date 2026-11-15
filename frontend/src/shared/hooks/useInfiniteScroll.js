import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 50;

/**
 * Server-side infinite scroll pagination.
 *
 * The hook is intentionally UI-free: it returns the sentinel ref and loading
 * flags, and the feature renders `LoadMoreSentinel` (or any other indicator).
 */
export function useServerInfiniteScroll(fetchPage, pageSize = PAGE_SIZE, deps = []) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queryVersion, setQueryVersion] = useState(0);
  const sentinelRef = useRef(null);
  const fetchPageRef = useRef(fetchPage);
  const requestVersionRef = useRef(0);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  const reset = useCallback(() => {
    requestVersionRef.current += 1;
    setItems([]);
    setPage(0);
    setHasMore(true);
    setLoading(false);
    setInitialLoading(true);
    setError(null);
    setQueryVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    reset();
  }, [reset, ...deps]);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = requestVersionRef.current;

    const fetchCurrentPage = async () => {
      if (!fetchPageRef.current) return;
      setLoading(true);

      try {
        const data = await fetchPageRef.current(page, pageSize);
        if (cancelled || requestVersion !== requestVersionRef.current) return;

        setItems((previous) =>
          page === 0 ? data.content : [...previous, ...data.content],
        );
        setHasMore(!data.last);
        setError(null);
      } catch (error) {
        if (!cancelled && requestVersion === requestVersionRef.current) {
          console.error("Error fetching page:", error);
          setError(error);
          setHasMore(false);
        }
      } finally {
        if (!cancelled && requestVersion === requestVersionRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchCurrentPage();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, queryVersion]);

  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((current) => current + 1);
        }
      },
      { threshold: 0.1 },
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, loading]);

  return {
    items,
    loading,
    initialLoading,
    hasMore,
    sentinelRef,
    reset,
    error,
  };
}

/**
 * Client-side infinite scroll over an already-loaded array.
 */
export function useInfiniteScroll(allItems = [], pageSize = PAGE_SIZE) {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setDisplayCount(pageSize);
  }, [allItems, pageSize]);

  const displayedItems = allItems.slice(0, displayCount);
  const hasMore = displayCount < allItems.length;

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((current) =>
            Math.min(current + pageSize, allItems.length),
          );
        }
      },
      { threshold: 0.1 },
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, allItems.length, pageSize]);

  return { displayedItems, sentinelRef, hasMore };
}

export default useInfiniteScroll;
