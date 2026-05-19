import { useState } from "react";
import { Leaf } from "lucide-react";

const CREAM = "#f5ede2";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.2)";

export default function FounderPhotoCard() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="mb-5 flex justify-center">
      <figure
        className="w-full max-w-xs rounded-3xl border p-3 text-center shadow-sm"
        style={{ background: CREAM, borderColor: BORDER }}
      >
        <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 shadow-sm" style={{ borderColor: GREEN, background: "#faf6f1" }}>
          {!imageFailed ? (
            <img
              src="https://media.base44.com/images/public/69f855fbccd3f90a3663fb94/03f450f10_C1F95A21-F875-4BB1-B648-916D41C51BAE.png"
              alt="Misty Stonerock, founder of Rooted 21 Parenting Network"
              className="h-full w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
              <Leaf size={42} color={GREEN} />
              <span className="font-serif text-lg font-black" style={{ color: DARK }}>Rooted 21</span>
            </div>
          )}
        </div>
        <figcaption className="mt-3">
          <p className="font-serif text-lg font-black" style={{ color: DARK }}>Misty Stonerock</p>
          <p className="text-xs font-bold" style={{ color: GREEN }}>Founder of Rooted 21 Parenting Network</p>
          <p className="mt-1 text-[11px] leading-5" style={{ color: MUTED }}>Community Behavioral Health Worker • Recovery Advocate • Mom • Parent Mentor</p>
        </figcaption>
      </figure>
    </div>
  );
}