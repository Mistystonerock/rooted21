import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SUPPORTED_LANGUAGES = ["en", "es", "so"];
const LABELS = {
  en: { appName: "Rooted 21", loading: "Loading", saveDraft: "Draft saved", continue: "Continue" },
  es: { appName: "Rooted 21", loading: "Cargando", saveDraft: "Borrador guardado", continue: "Continuar" },
  so: { appName: "Rooted 21", loading: "Soo raraya", saveDraft: "Qabyo waa la kaydiyay", continue: "Sii wad" }
};

const I18nContext = createContext({ language: "en", setLanguage: () => {}, t: key => key });

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("rooted_language") || "en");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    localStorage.setItem("rooted_language", language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: next => setLanguageState(SUPPORTED_LANGUAGES.includes(next) ? next : "en"),
    t: key => LABELS[language]?.[key] || LABELS.en[key] || key,
    supportedLanguages: SUPPORTED_LANGUAGES
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}