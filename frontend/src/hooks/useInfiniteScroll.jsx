import { useState, useEffect, useRef, useCallback } from "react";
import { Spinner } from "react-bootstrap";

const PAGE_SIZE = 50;

/**
 * Hook for server-side infinite scroll pagination.
 * Fetches pages from the server on demand as the user scrolls.
 * 
 * @param {Function} fetchPage - Async function (page, size) => { content, last, totalElements, totalPages, number }
 * @param {number} pageSize - Number of items per page (default: 50)
 * @param {Array} deps - Dependencies that trigger a reset (e.g., filters)
 * @returns {{ items, loading, hasMore, LoadMoreSpinner, reset }}
 */
export function useServerInfiniteScroll(fetchPage, pageSize = PAGE_SIZE, deps = []) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef(null);
  const abortRef = useRef(false);

  // Reset when deps change
  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    abortRef.current = true;
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, deps);

  // Fetch page on page/deps change
  useEffect(() => {
    let cancelled = false;
    abortRef.current = false;

    const doFetch = async () => {
      if (!fetchPage) return;
      setLoading(true);
      try {
        const data = await fetchPage(page, pageSize);
        if (cancelled || abortRef.current) return;
        
        setItems((prev) => page === 0 ? data.content : [...prev, ...data.content]);
        setHasMore(!data.last);
      } catch (error) {
        if (!cancelled && !abortRef.current) {
          console.error("Error fetching page:", error);
          setHasMore(false);
        }
      } finally {
        if (!cancelled && !abortRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    doFetch();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchPage, pageSize, ...deps]);

  // IntersectionObserver to load more when sentinel is visible
  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading]);

  const LoadMoreSpinner = useCallback(() => {
    if (!hasMore) return null;
    return (
      <div ref={sentinelRef} className="text-center py-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">Loading more...</span>
      </div>
    );
  }, [hasMore]);

  return { items, loading, initialLoading, hasMore, LoadMoreSpinner, reset };
}

/**
 * Hook for client-side infinite scroll pagination.
 * Takes a full array of items and returns a paginated slice that grows as the user scrolls.
 * 
 * @param {Array} allItems - The full array of items
 * @param {number} pageSize - Number of items per page (default: 50)
 * @returns {{ displayedItems, sentinelRef, hasMore, LoadMoreSpinner }}
 */
export function useInfiniteScroll(allItems = [], pageSize = PAGE_SIZE) {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const sentinelRef = useRef(null);

  // Reset display count when items change
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [allItems, pageSize]);

  const displayedItems = allItems.slice(0, displayCount);
  const hasMore = displayCount < allItems.length;

  // IntersectionObserver to load more when sentinel is visible
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + pageSize, allItems.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, allItems.length, pageSize]);

  const LoadMoreSpinner = useCallback(() => {
    if (!hasMore) return null;
    return (
      <div ref={sentinelRef} className="text-center py-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted">Loading more...</span>
      </div>
    );
  }, [hasMore]);

  return { displayedItems, sentinelRef, hasMore, LoadMoreSpinner };
}

export default useInfiniteScroll;
