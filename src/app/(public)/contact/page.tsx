
"use client";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";

export default function ContactPage() {
  const {t}=useLanguage();
  return <div className="mx-auto max-w-5xl px-5 py-14">
    <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
      <div>
        <Image src="/brand/alraid-logo.JPG" alt="ALRAID" width={300} height={184} className="mb-7 h-32 w-auto rounded-2xl object-contain"/>
        <p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">ALRAID CAR RENTAL</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{t.contactTitle}</h1>
        <p className="mt-4 leading-7 text-slate-500">{t.contactText}</p>
        <Link href="/booking" className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500">{t.bookCar}</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="tel:+9647701886516" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"><Phone className="h-6 w-6 text-blue-600"/><h3 className="mt-5 font-black">{t.phone}</h3><p className="mt-2 text-sm text-slate-500" dir="ltr">07701886516</p></a>
        <a href="mailto:alraadkirkuk@gmail.com" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"><Mail className="h-6 w-6 text-blue-600"/><h3 className="mt-5 font-black">{t.email}</h3><p className="mt-2 break-all text-sm text-slate-500">alraadkirkuk@gmail.com</p></a>
        <a href="https://wa.me/9647701886516" target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"><MessageCircle className="h-6 w-6 text-emerald-600"/><h3 className="mt-5 font-black">{t.whatsapp}</h3><p className="mt-2 text-sm text-slate-500">{t.openWhatsapp}</p></a>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><MapPin className="h-6 w-6 text-blue-600"/><h3 className="mt-5 font-black">{t.address}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{t.location}</p></div>
      </div>
    </div>
  </div>;
}
