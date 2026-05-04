import { C } from "@/lib/rooted-constants";
import TreeLogo from "./TreeLogo";
import LoadingDots from "./LoadingDots";

export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: C.darkGreen }}
    >
      <div style={{ animation: "breathe 3.5s ease-in-out infinite" }}>
        <TreeLogo size={72} />
      </div>
      <h2 className="font-serif" style={{ color: C.cream }}>
        Finding your support…
      </h2>
      <p className="leading-loose" style={{ color: C.lightGreen }}>
        One slow breath in.
        <br />
        One slow breath out.
        <br />
        <strong style={{ color: C.cream }}>Your calm is the first intervention.</strong>
      </p>
      <LoadingDots />
    </div>
  );
}