
"use client";
import Link from "next/link";
import Image from "next/image";
import { PhoneCall, Menu, X } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/useLanguage";

export default function PublicHeader() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={()=>setOpen(false)}>
          <Image src="/brand/alraid-logo.JPG" alt="شركة الرائد لتأجير السيارات" width={92} height={56}
            className="h-12 w-auto rounded-xl object-contain" priority />
          <span className="hidden sm:block min-w-0">
            <span className="block truncate text-sm font-black text-slate-950">شركة الرائد لتأجير السيارات</span>
            <span className="block text-[11px] text-slate-400">ALRAID Car Rental · Kirkuk</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold md:flex">
          <Link href="/" className="hover:text-blue-600">{t.home}</Link>
          <Link href="/fleet" className="hover:text-blue-600">{t.fleet}</Link>
          <Link href="/booking" className="hover:text-blue-600">{t.booking}</Link>
          <Link href="/contact" className="hover:text-blue-600">{t.contact}</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <a href="tel:+9647701886516" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500">
            <PhoneCall className="h-4 w-4" /> {t.bookCar}
          </a>
        </div>
        <button type="button" className="md:hidden rounded-xl border border-slate-200 p-2" onClick={()=>setOpen(v=>!v)} aria-label="Menu">
          {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </button>
      </div>
      {open && <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
        <nav className="mx-auto flex max-w-6xl flex-col gap-2 text-sm font-bold">
          <Link onClick={()=>setOpen(false)} href="/" className="rounded-xl px-3 py-2 hover:bg-slate-50">{t.home}</Link>
          <Link onClick={()=>setOpen(false)} href="/fleet" className="rounded-xl px-3 py-2 hover:bg-slate-50">{t.fleet}</Link>
          <Link onClick={()=>setOpen(false)} href="/booking" className="rounded-xl px-3 py-2 hover:bg-slate-50">{t.booking}</Link>
          <Link onClick={()=>setOpen(false)} href="/contact" className="rounded-xl px-3 py-2 hover:bg-slate-50">{t.contact}</Link>
          <div className="flex items-center gap-2 pt-2"><LanguageSwitcher/><a href="tel:+9647701886516" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-white">{t.bookCar}</a></div>
        </nav>
      </div>}
    </header>
  );
}
