import { useEffect, useMemo, useState } from "react";

export default function useOfflineDraft(key, initialValue = {}) {
  const storageKey = useMemo(() => `rooted_draft_${key}`, [key]);
  const [draft, setDraft] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialValue;
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return {
    draft,
    setDraft,
    isOnline,
    clearDraft: () => {
      localStorage.removeItem(storageKey);
      setDraft(initialValue);
    }
  };
}