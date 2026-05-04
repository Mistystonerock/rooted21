import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { C } from "@/lib/rooted-constants";

/**
 * Enhanced pull-to-refresh with native-like animation.
 * Non-intrusive to sticky headers. Smooth, consistent behavior.
 */
export default function MobileRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && touchStartY.current) {
        const current = e.touches[0].clientY;
        const distance = current - touchStartY.current;
        if (distance > 0) {
          setPullDistance(Math.min(distance, 80));
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 50 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      touchStartY.current = 0;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef}>
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center transition-all"
          style={{
            height: `${pullDistance}px`,
            overflow: "hidden",
          }}
        >
          <RefreshCw
            size={18}
            color={C.midGreen}
            style={{
              transform: `rotate(${(pullDistance / 80) * 180}deg)`,
              opacity: pullDistance / 80,
            }}
          />
        </div>
      )}

      {/* Loading spinner */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-3">
          <RefreshCw
            size={16}
            color={C.midGreen}
            className="animate-spin"
          />
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}