import { useEffect, useState } from "react";
import { Accessibility, Eye, Languages, Type, Volume2, X } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

const FONT_SIZES = {
  normal: "16px",
  large: "18px",
  xlarge: "20px",
};

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("rooted21_font_size") || "normal");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("rooted21_high_contrast") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("rooted21_language") || "en");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize] || FONT_SIZES.normal;
    localStorage.setItem("rooted21_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.body.classList.toggle("rooted-high-contrast", highContrast);
    localStorage.setItem("rooted21_high_contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const selected = LANGUAGES.find(item => item.code === language) || LANGUAGES[0];
    document.documentElement.lang = selected.code;
    document.documentElement.dir = selected.dir;
    localStorage.setItem("rooted21_language", language);
  }, [language]);

  function readPageSummary() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const mainText = document.querySelector("main")?.innerText || document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(mainText.slice(0, 1800));
    utterance.lang = language;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="fixed left-3 top-16 z-50" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label="Open accessibility settings"
        aria-expanded={open}
        className="rounded-full shadow-lg"
        style={{ width: 46, height: 46, background: C.darkGreen, color: C.cream, border: `2px solid ${C.gold}` }}
      >
        {open ? <X size={20} /> : <Accessibility size={22} />}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Accessibility settings"
          className="mt-2 w-[280px] rounded-2xl p-4 shadow-xl"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Accessibility</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Adjust reading comfort, language direction, contrast, and audio support.</p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><Languages size={14} /> Language</span>
              <select
                value={language}
                onChange={event => setLanguage(event.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              >
                {LANGUAGES.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>

            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}><Type size={14} /> Font size</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "normal", label: "A" },
                  { key: "large", label: "A+" },
                  { key: "xlarge", label: "A++" },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFontSize(item.key)}
                    aria-pressed={fontSize === item.key}
                    className="rounded-xl px-2 py-2 text-xs font-black"
                    style={{ background: fontSize === item.key ? C.darkGreen : C.offWhite, color: fontSize === item.key ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHighContrast(value => !value)}
              aria-pressed={highContrast}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold"
              style={{ background: highContrast ? C.darkGreen : C.offWhite, color: highContrast ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}
            >
              <span className="flex items-center gap-2"><Eye size={14} /> High contrast</span>
              <span>{highContrast ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              onClick={readPageSummary}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold"
              style={{ background: C.gold, color: C.darkGreen, border: "none" }}
            >
              <span className="flex items-center gap-2"><Volume2 size={14} /> Read page aloud</span>
              <span>{speaking ? "Stop" : "Play"}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}