"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Car } from "lucide-react";
import Link from "next/link";

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const TRANSMISSIONS = ["AUTOMATIC", "MANUAL"];
const STATUSES = ["AVAILABLE", "RENTED", "RESERVED", "MAINTENANCE", "INACTIVE"];

const INIT = {
  name:"", make:"", model:"", year: new Date().getFullYear(), color:"", plate:"", vin:"",
  fuelType:"PETROL", transmission:"AUTOMATIC", seats:5, mileage:0,
  dailyPrice:0, weeklyPrice:"", monthlyPrice:"", customPrice:"", deposit:0,
  description:"", status:"AVAILABLE",
};

export default function NewCarPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string,string|number>>(INIT as unknown as Record<string,string|number>);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string|number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          weeklyPrice: form.weeklyPrice === "" ? null : Number(form.weeklyPrice),
          monthlyPrice: form.monthlyPrice === "" ? null : Number(form.monthlyPrice),
          customPrice: form.customPrice === "" ? null : Number(form.customPrice),
          vin: form.vin === "" ? null : form.vin,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error?.formErrors?.join(", ") || d.error || "Failed"); return; }
      router.push(`/cars/${d.car.id}`);
    } finally { setSaving(false); }
  };

  const Field = ({ label, name, type="text", step, min, placeholder, opts }: { label:string;name:string;type?:string;step?:string;min?:string;placeholder?:string;opts?:string[] }) => (
    <div>
      <label className="label">{label}</label>
      {opts
        ? <select className="input" value={form[name] as string} onChange={e => set(name, e.target.value)}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input type={type} step={step} min={min} placeholder={placeholder} className="input"
            value={form[name] as string} onChange={e => set(name, type==="number" ? Number(e.target.value) : e.target.value)} />}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/cars" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title flex items-center gap-2"><Car className="w-6 h-6" />Add New Car</h1>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Vehicle Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Car Name *" name="name" placeholder="e.g. Toyota Corolla 2022" />
            <Field label="Make *" name="make" placeholder="e.g. Toyota" />
            <Field label="Model *" name="model" placeholder="e.g. Corolla" />
            <Field label="Year *" name="year" type="number" min="1980" />
            <Field label="Color *" name="color" placeholder="e.g. White" />
            <Field label="License Plate *" name="plate" placeholder="e.g. 12-ب-1234" />
            <Field label="VIN / Chassis (optional)" name="vin" />
            <Field label="Fuel Type" name="fuelType" opts={FUEL_TYPES} />
            <Field label="Transmission" name="transmission" opts={TRANSMISSIONS} />
            <Field label="Seats" name="seats" type="number" min="1" />
            <Field label="Current Mileage (km)" name="mileage" type="number" min="0" />
            <Field label="Status" name="status" opts={STATUSES} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={form.description as string} onChange={e => set("description", e.target.value)} placeholder="Optional notes about the vehicle..." />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing (IQD)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Daily Price *" name="dailyPrice" type="number" min="0" step="500" />
            <Field label="Weekly Price" name="weeklyPrice" type="number" min="0" step="1000" placeholder="Optional" />
            <Field label="Monthly Price" name="monthlyPrice" type="number" min="0" step="1000" placeholder="Optional" />
            <Field label="Custom Price" name="customPrice" type="number" min="0" step="500" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Security Deposit (IQD)" name="deposit" type="number" min="0" step="1000" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Car"}
          </button>
          <Link href="/cars" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}