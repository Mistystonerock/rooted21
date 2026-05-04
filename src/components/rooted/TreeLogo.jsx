import { C } from "@/lib/rooted-constants";

export default function TreeLogo({ size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      style={{ animation: "sway 7s ease-in-out infinite", transformOrigin: "50% 90%" }}
    >
      <path d="M40 70 Q28 74 18 79" stroke={C.brown} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 70 Q52 74 62 79" stroke={C.brown} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="38" y="44" width="4" height="26" rx="2" fill={C.brown} />
      <path d="M36 72 Q38 69 40 72 Q42 69 44 72 Q44 75 40 78 Q36 75 36 72Z" fill={C.brown} opacity="0.5" />
      <ellipse cx="40" cy="28" rx="20" ry="18" fill={C.darkGreen} />
      <ellipse cx="28" cy="34" rx="13" ry="11" fill={C.midGreen} />
      <ellipse cx="52" cy="34" rx="13" ry="11" fill={C.midGreen} />
      <ellipse cx="40" cy="20" rx="15" ry="13" fill={C.darkGreen} />
      <g fill="white" opacity="0.9">
        <circle cx="34" cy="51" r="2.2" />
        <rect x="32.8" y="53" width="2.8" height="6" rx="1.4" />
        <circle cx="40" cy="50" r="2.5" />
        <rect x="38.8" y="52" width="2.8" height="7" rx="1.4" />
        <circle cx="46" cy="51" r="2.2" />
        <rect x="44.8" y="53" width="2.8" height="6" rx="1.4" />
      </g>
    </svg>
  );
}