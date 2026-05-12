import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

export default function WinCelebration({ show, message, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: "spring", damping: 14 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-8"
        >
          <div
            className="rounded-3xl px-8 py-8 text-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #0a3d20, #1a6b3a)",
              border: "2px solid #c9973a",
              maxWidth: 320,
              width: "100%",
            }}
          >
            {/* Bouncing trophy */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: 3, duration: 0.5, ease: "easeInOut" }}
              className="flex justify-center mb-4"
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 72, height: 72, background: "rgba(201,151,58,0.2)", border: "2px solid #c9973a" }}
              >
                <Trophy size={36} color="#c9973a" />
              </div>
            </motion.div>

            <p className="font-serif font-bold text-2xl mb-2" style={{ color: "#f5e6c8" }}>
              🎉 Amazing!
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(245,230,200,0.85)" }}>
              {message}
            </p>
            <p className="text-sm mt-3 font-bold" style={{ color: "#c9973a" }}>
              Rooted 21 is proud of you 💚
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}