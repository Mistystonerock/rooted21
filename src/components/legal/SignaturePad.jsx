import { useRef, useState, useEffect } from "react";
import { C } from "@/lib/rooted-constants";
import { Trash2 } from "lucide-react";

export default function SignaturePad({ onSignatureChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    setHasSignature(true);
    onSignatureChange(dataUrl);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Draw your signature below</p>
        {hasSignature && (
          <button
            onClick={clearSignature}
            className="flex items-center gap-1 text-[11px] font-bold"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText }}
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `2px solid ${hasSignature ? C.midGreen : C.cream}`, background: "#fff", touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          style={{ width: "100%", height: 120, display: "block", cursor: "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <p className="text-[10px]" style={{ color: C.mutedText }}>
        {hasSignature ? "✓ Signature captured" : "Sign with your finger or mouse"}
      </p>
    </div>
  );
}