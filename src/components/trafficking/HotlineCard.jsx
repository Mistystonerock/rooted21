import { Phone, MessageSquare, Globe } from "lucide-react";
import { C } from "@/lib/rooted-constants";

// National Human Trafficking Hotline contact options — call, text, chat.
export default function HotlineCard() {
  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
      <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>National Human Trafficking Hotline</h2>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.mutedText }}>
        Free, confidential, and available 24/7. You do not have to share your name or explain everything to get help.
      </p>

      <a href="tel:18883737888" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline shadow-lg"
        style={{ background: C.darkGreen, color: "#fff" }}>
        <Phone size={20} /> Call 1-888-373-7888
      </a>

      <a href="sms:233733" className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline"
        style={{ background: C.midGreen, color: "#fff" }}>
        <MessageSquare size={20} /> Text 233733 (BeFree)
      </a>

      <a href="https://humantraffickinghotline.org/en/chat" target="_blank" rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline"
        style={{ background: "#fff", color: C.darkGreen, border: `2px solid ${C.darkGreen}` }}>
        <Globe size={20} /> Open live chat
      </a>
    </section>
  );
}