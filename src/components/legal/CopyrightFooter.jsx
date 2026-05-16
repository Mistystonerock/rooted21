import { C } from "@/lib/rooted-constants";

export default function CopyrightFooter({ hasBottomNav = false }) {
  return (
    <footer
      className="px-4 py-5 text-center"
      style={{
        background: C.offWhite,
        borderTop: `1px solid ${C.cream}`,
        paddingBottom: hasBottomNav ? "calc(88px + env(safe-area-inset-bottom))" : "max(20px, env(safe-area-inset-bottom))",
      }}
    >
      <p className="mx-auto max-w-[720px] text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
        © 2026 Rooted 21 Parenting Network LLC. All rights reserved. Trademark pending. Chillicothe, Ross County, Ohio. rooted21parenting.org
      </p>
    </footer>
  );
}