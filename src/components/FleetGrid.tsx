
"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Fuel, Settings2, Users } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";

type Car = {
  id:string; name:string; make:string; model:string; year:number; color:string;
  fuelType:string; transmission:string; seats:number; description:string|null;
  images:{url:string; isPrimary:boolean}[];
};

const names: Record<string,{ar:string;en:string}> = {
  "Toyota Corolla": { ar:"تويوتا كورولا", en:"Toyota Corolla" },
  "Dodge Challenger": { ar:"دوج تشالنجر", en:"Dodge Challenger" },
  "Toyota Camry": { ar:"تويوتا كامري", en:"Toyota Camry" },
};

export default function FleetGrid({ cars }: { cars: Car[] }) {
  const { t, lang } = useLanguage();
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {cars.map(car => {
      const title = names[car.name]?.[lang] ?? car.name;
      const image = car.images.find(i=>i.isPrimary)?.url ?? car.images[0]?.url;
      return <article key={car.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-72 overflow-hidden bg-slate-100">
          {image ? <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw"/> : <div className="flex h-full items-center justify-center text-6xl opacity-30">🚗</div>}
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">● {t.available}</div>
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{car.year} · {car.color}</p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><Users className="h-4 w-4"/>{car.seats} {t.seats}</span>
            <span className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><Settings2 className="h-4 w-4"/>{t.automatic}</span>
            <span className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><Fuel className="h-4 w-4"/>{t.petrol}</span>
            <span className="rounded-xl bg-blue-50 p-2 text-blue-700">{lang==="ar" ? "متاحة للحجز" : "Ready to book"}</span>
          </div>
          <Link href={`/booking?carId=${car.id}&carName=${encodeURIComponent(car.name)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition">
            {t.requestCar}<ArrowRight className="h-4 w-4"/>
          </Link>
        </div>
      </article>;
    })}
    {cars.length===0 && <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400"><div className="mb-4 text-5xl">🚘</div><p>{t.noCars}</p></div>}
  </div>;
}
