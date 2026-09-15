
"use client";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";

export default function PublicFooter() {
  const { t } = useLanguage();
  return <footer className="mt-20 border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
      <div>
        <Image src="/brand/alraid-logo.JPG" alt="ALRAID" width={150} height={92} className="h-16 w-auto rounded-xl object-contain"/>
        <p className="mt-4 text-sm leading-6 text-slate-500">{t.footer}</p>
      </div>
      <div>
        <h3 className="font-black text-slate-900">{t.contact}</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <a className="flex items-center gap-2 hover:text-blue-600" href="tel:+9647701886516"><Phone className="h-4 w-4"/>07701886516</a>
          <a className="flex items-center gap-2 hover:text-blue-600" href="mailto:alraadkirkuk@gmail.com"><Mail className="h-4 w-4"/>alraadkirkuk@gmail.com</a>
          <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{t.location}</span>
        </div>
      </div>
      <div>
        <h3 className="font-black text-slate-900">{t.fleet}</h3>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
          <Link href="/fleet" className="hover:text-blue-600">{t.viewCars}</Link>
          <Link href="/booking" className="hover:text-blue-600">{t.bookCar}</Link>
          <Link href="/contact" className="hover:text-blue-600">{t.contact}</Link>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} شركة الرائد لتأجير السيارات · ALRAID Car Rental</div>
  </footer>;
}
