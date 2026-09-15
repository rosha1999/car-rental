
"use client";
import { useLanguage } from "@/i18n/useLanguage";
export default function FleetIntro(){
 const {t}=useLanguage();
 return <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">{t.fleetKicker}</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{t.fleetTitle}</h1><p className="mt-3 max-w-2xl text-slate-500">{t.fleetText}</p></div>
}
