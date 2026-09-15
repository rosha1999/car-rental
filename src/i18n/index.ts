import ar from "./ar";
import en from "./en";
import ku from "./ku";

export type Locale = "ar" | "en" | "ku";
export const locales: Locale[] = ["ar", "en", "ku"];
export const localeNames: Record<Locale, string> = { ar: "العربية", en: "English", ku: "کوردی" };
export const localeDir: Record<Locale, "rtl" | "ltr"> = { ar: "rtl", en: "ltr", ku: "rtl" };
const translations: Record<Locale, typeof ar> = { ar, en: en as typeof ar, ku: ku as typeof ar };
export function t(locale: Locale, key: keyof typeof ar): string {
  return (translations[locale] as Record<string,string>)[key] ?? (translations.en as Record<string,string>)[key] ?? key;
}
export { ar, en, ku };