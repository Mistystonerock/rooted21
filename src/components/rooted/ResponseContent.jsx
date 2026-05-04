import { C } from "@/lib/rooted-constants";

export default function ResponseContent({ text }) {
  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;

        if (/^\*\*[🌳🌿💬🚫💛📘]/.test(line)) {
          const clean = line.replace(/\*\*/g, "");
          return (
            <div
              key={i}
              className="font-serif text-[15px] font-bold my-4 mb-2 pl-3"
              style={{ color: C.darkGreen, borderLeft: `4px solid ${C.midGreen}` }}
            >
              {clean}
            </div>
          );
        }

        const num = line.match(/^(\d+)\.\s+(.*)/);
        if (num) {
          return (
            <div key={i} className="flex gap-3 mb-2">
              <div
                className="min-w-[24px] h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                style={{ background: C.cream, border: `2px solid ${C.midGreen}`, color: C.darkGreen }}
              >
                {num[1]}
              </div>
              <p className="m-0 text-sm leading-relaxed" style={{ color: C.darkText }}>
                {num[2]}
              </p>
            </div>
          );
        }

        if (line.trim().startsWith('"')) {
          return (
            <div
              key={i}
              className="rounded-xl px-3.5 py-2.5 my-1.5"
              style={{ background: C.cream, borderLeft: `3px solid ${C.brown}` }}
            >
              <p className="m-0 text-sm italic leading-relaxed" style={{ color: C.darkGreen }}>
                {line}
              </p>
            </div>
          );
        }

        if (/^[-•]/.test(line)) {
          return (
            <p key={i} className="my-1 text-sm leading-relaxed" style={{ color: C.darkText }}>
              • {line.replace(/^[-•]\s*/, "")}
            </p>
          );
        }

        return (
          <p key={i} className="my-1 text-sm leading-relaxed" style={{ color: C.darkText }}>
            {line.replace(/\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}