import { useCallback, useRef, useState } from "react";
import { C } from "@/lib/rooted-constants";

/**
 * Pull-to-refresh with native-like feel.
 * - Uses refs for all gesture state to avoid stale closures
 * - No interference with sticky headers (indicator pushes content, doesn't overlay)
 * - Smooth eased animation via CSS transition
 */
const THRESHOLD = 60;  // px to trigger refresh
const MAX_PULL = 80;   // max visual pull distance

export default function MobileRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use refs so event handlers always see latest values (no stale closure)
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0 && !refreshingRef.current) {
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pullingRef.current || refreshingRef.current) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) {
      // Logarithmic resistance so it feels elastic
      const dist = Math.min(MAX_PULL, dy * 0.5);
      setPullDistance(dist);
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;

    const dist = pullDistance; // capture before reset
    setPullDistance(0);

    if (dist >= THRESHOLD && !refreshingRef.current) {
      refreshingRef.current = true;
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
    startYRef.current = 0;
  }, [pullDistance, onRefresh]);

  // Attach listeners via React synthetic events on the wrapper div
  // This keeps listeners scoped and avoids window-level conflicts
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull / refresh indicator — pushes content down, never overlays header */}
      <div
        style={{
          height: isRefreshing ? 44 : pullDistance,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: pullDistance === 0 ? "height 0.2s ease" : "none",
        }}
        aria-hidden="true"
      >
        {(pullDistance > 4 || isRefreshing) && (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.midGreen}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isRefreshing
                ? "none"
                : `rotate(${(pullDistance / MAX_PULL) * 270}deg)`,
              opacity: isRefreshing ? 1 : Math.min(1, pullDistance / THRESHOLD),
              animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
            }}
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        )}
      </div>

      {children}
    </div>
  );
}