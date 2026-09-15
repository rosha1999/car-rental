
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/i18n/useLanguage";

export default function BookingPage() {
  const {t, lang}=useLanguage();
  const sp=useSearchParams();
  const [form,setForm]=useState({fullName:"",phone:"",carId:sp.get("carId")??"",startDate:"",endDate:"",notes:"",preferredCar:sp.get("carName")??""});
  const [cars,setCars]=useState<{id:string;name:string}[]>([]);
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/public/cars").then(r=>r.json()).then(d=>setCars(d.cars??[]));},[]);
  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setSubmitting(true);setError("");try{
    const r=await fetch("/api/booking-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json(); if(!r.ok){setError(d.error||t.failed);return;} setSubmitted(true);
  }finally{setSubmitting(false);}};
  if(submitted) return <div className="mx-auto max-w-lg px-5 py-24 text-center"><div className="text-6xl">✅</div><h1 className="mt-5 text-3xl font-black">{t.received}</h1><p className="mt-3 leading-7 text-slate-500">{t.receivedText} <b dir="ltr">{form.phone}</b>.</p></div>;
  return <div className="mx-auto max-w-2xl px-5 py-14">
    <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">ALRAID</p><h1 className="mt-2 text-4xl font-black">{t.bookingTitle}</h1><p className="mt-3 text-slate-500">{t.bookingText}</p></div>
    {error&&<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div><label className="label">{t.fullName} *</label><input required value={form.fullName} onChange={e=>set("fullName",e.target.value)} className="input" placeholder={lang==="ar"?"أحمد علي":"Ahmed Ali"}/></div>
      <div><label className="label">{t.phoneNumber} *</label><input required type="tel" dir="ltr" value={form.phone} onChange={e=>set("phone",e.target.value)} className="input text-left" placeholder="07XX XXX XXXX"/></div>
      <div><label className="label">{t.preferredCar}</label><select value={form.carId} onChange={e=>set("carId",e.target.value)} className="input"><option value="">{t.anyCar}</option>{cars.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="label">{t.startDate} *</label><input required type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)} className="input"/></div><div><label className="label">{t.endDate} *</label><input required type="date" value={form.endDate} onChange={e=>set("endDate",e.target.value)} className="input"/></div></div>
      <div><label className="label">{t.notes}</label><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={4} placeholder={t.notesPlaceholder} className="input resize-none"/></div>
      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">{submitting?t.submitting:t.submit}</button>
    </form>
  </div>;
}
