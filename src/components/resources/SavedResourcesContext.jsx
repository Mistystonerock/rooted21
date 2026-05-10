import { createContext, useContext, useState, useEffect } from "react";

const KEY = "rooted21_saved_resources";

const SavedContext = createContext(null);

export function SavedResourcesProvider({ children }) {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved]);

  function toggle(id) {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function isSaved(id) { return saved.includes(id); }

  return (
    <SavedContext.Provider value={{ saved, toggle, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() { return useContext(SavedContext); }