import { C } from "@/lib/rooted-constants";
import ResponseContent from "./ResponseContent";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3"
          style={{ background: C.darkGreen }}
        >
          <p className="text-sm leading-relaxed" style={{ color: C.cream }}>
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: C.midGreen }}
      >
        <span className="text-xs">🌿</span>
      </div>
      <div
        className="max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ background: C.white, border: `1px solid ${C.cream}` }}
      >
        <ResponseContent text={message.content} />
      </div>
    </div>
  );
}