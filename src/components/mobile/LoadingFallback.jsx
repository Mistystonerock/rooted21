import { C } from "@/lib/rooted-constants";

/**
 * Fallback component shown while lazy-loaded routes load.
 */
export default function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: C.offWhite }}>
      <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: `1px solid ${C.cream}` }}>
        <div className="mx-auto h-8 w-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
        <p className="mt-3 text-sm font-bold" style={{ color: C.darkGreen }}>Loading Rooted 21…</p>
        <p className="mt-1 text-xs" style={{ color: C.mutedText }}>Preparing a calm, secure space.</p>
      </div>
    </div>
  );
}