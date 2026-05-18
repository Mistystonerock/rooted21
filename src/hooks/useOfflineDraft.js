import { useEffect, useMemo, useState } from "react";

function readDraft(storageKey, initialValue) {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialValue;
  } catch {
    return initialValue;
  }
}

export default function useOfflineDraft(key, initialValue = {}) {
  const storageKey = useMemo(() => `rooted_draft_${key}`, [key]);
  const [draft, setDraft] = useState(() => readDraft(storageKey, initialValue));
  const [saveError, setSaveError] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, 250);
    return () => clearTimeout(timer);
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
    saveError,
    hasDraft: JSON.stringify(draft) !== JSON.stringify(initialValue),
    clearDraft: () => {
      localStorage.removeItem(storageKey);
      setDraft(initialValue);
      setSaveError(false);
    }
  };
}