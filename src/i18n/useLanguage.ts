
"use client";
import { useEffect, useState } from "react";
import { publicTranslations, type Language } from "./public";

export function useLanguage() {
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("site-language");
    const next: Language = saved === "en" ? "en" : "ar";
    setLangState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    const onChange = () => {
      const value = window.localStorage.getItem("site-language");
      const nextValue: Language = value === "en" ? "en" : "ar";
      setLangState(nextValue);
      document.documentElement.lang = nextValue;
      document.documentElement.dir = nextValue === "ar" ? "rtl" : "ltr";
    };
    window.addEventListener("site-language-change", onChange);
    return () => window.removeEventListener("site-language-change", onChange);
  }, []);

  const setLang = (next: Language) => {
    window.localStorage.setItem("site-language", next);
    setLangState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new Event("site-language-change"));
  };

  return { lang, t: publicTranslations[lang], setLang };
}
