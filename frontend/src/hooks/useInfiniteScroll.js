import { useState, useEffect, useRef, useCallback } from "react";
import { Spinner } from "react-bootstrap";

const PAGE_SIZE = 50;

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
