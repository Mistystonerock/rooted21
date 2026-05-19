import { useEffect } from "react";

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='tab']",
  "[role='menuitem']",
  "[role='link']",
  "[tabindex]:not([tabindex='-1'])",
  ".cursor-pointer",
].join(",");

function isTypingTarget(element) {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

function ensureFocusable(element) {
  if (!element || element.tabIndex >= 0) return;
  const tag = element.tagName?.toLowerCase();
  if (["button", "a", "input", "select", "textarea"].includes(tag)) return;
  element.setAttribute("tabindex", "0");
}

export default function useDesktopInteractionSupport() {
  useEffect(() => {
    const refreshFocusableElements = () => {
      document.querySelectorAll("[role='button'], [role='tab'], [role='menuitem'], [role='link'], .cursor-pointer").forEach(ensureFocusable);
    };

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || isTypingTarget(event.target)) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      const target = event.target?.closest?.(INTERACTIVE_SELECTOR);
      if (!target || target.matches("button, a[href], input, select, textarea")) return;

      event.preventDefault();
      target.click();
    };

    const observer = new MutationObserver(refreshFocusableElements);
    refreshFocusableElements();
    document.addEventListener("keydown", handleKeyDown, true);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      observer.disconnect();
    };
  }, []);
}