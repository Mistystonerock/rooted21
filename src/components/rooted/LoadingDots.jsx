import { C } from "@/lib/rooted-constants";

export default function LoadingDots() {
  return (
    <div className="flex gap-2 py-3 justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: C.midGreen,
            animation: `blink 1.4s ease-in-out ${i * 0.25}s infinite`,
          }}
        />
      ))}
    </div>
  );
}