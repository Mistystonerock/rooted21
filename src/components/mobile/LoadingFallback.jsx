import { C } from "@/lib/rooted-constants";

/**
 * Fallback component shown while lazy-loaded routes load.
 */
export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: C.offWhite }}>
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
    </div>
  );
}