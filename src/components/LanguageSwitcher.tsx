
"use client";
import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";

export default function LanguageSwitcher() {
  const { lang, t, setLang } = useLanguage();
  return (
    <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition"
      aria-label="Change language">
      <Languages className="h-4 w-4" />
      {t.language}
    </button>
  );
}
