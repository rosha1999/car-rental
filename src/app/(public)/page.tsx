
"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CarFront, ShieldCheck, Sparkles, PhoneCall } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";

export default function HomePage() {
  const { t, lang } = useLanguage();
  return <div>
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(37,99,235,.35),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4 text-blue-300" /> {t.heroKicker}
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">{t.heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{t.heroText}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/fleet" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold hover:bg-blue-500">{t.viewCars} <ArrowRight className="h-5 w-5" /></Link>
            <a href="tel:+9647701886516" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold hover:bg-white/10"><PhoneCall className="h-5 w-5" /> {t.callUs}</a>
          </div>
          <div className="mt-6 text-xs text-slate-500">{t.privacy}</div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-900">
            <Image src="/cars/challenger/a2d56ae2-da67-4241-979e-5fe1cd557aa1.JPG" alt="ALRAID fleet" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-sm font-bold text-blue-300">{lang==="ar" ? "أسطول شركة الرائد" : "ALRAID Fleet"}</p>
              <p className="mt-1 text-2xl font-black">{lang==="ar" ? "سيارات حقيقية، خدمة حقيقية" : "Real cars. Real local service."}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { icon: CarFront, title: t.quality, desc: t.qualityText },
          { icon: Sparkles, title: t.easy, desc: t.easyText },
          { icon: ShieldCheck, title: t.support, desc: t.supportText },
        ].map(({ icon: Icon, title, desc }) => <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><Icon className="h-7 w-7 text-blue-600"/><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-slate-500">{desc}</p></div>)}
      </div>
    </section>
  </div>;
}
