"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ImagePlus, Trash2, Star } from "lucide-react";

const FUEL_TYPES = ["PETROL","DIESEL","ELECTRIC","HYBRID"];
const TRANSMISSIONS = ["AUTOMATIC","MANUAL"];
const STATUSES = ["AVAILABLE","RENTED","RESERVED","MAINTENANCE","INACTIVE"];

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Record<string,string|number> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<{id:string;url:string;isPrimary:boolean}[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/cars/${id}`).then(r => r.json()).then(d => {
      const c = d.car;
      setImages(c.images ?? []);
      setForm({ ...c, weeklyPrice: c.weeklyPrice ?? "", monthlyPrice: c.monthlyPrice ?? "", customPrice: c.customPrice ?? "", vin: c.vin ?? "" });
    });
  }, [id]);

  const set = (k: string, v: string|number) => setForm(f => f ? { ...f, [k]: v } : f);

  const addImage = async () => {
    if (!imageUrl.trim()) return; setImageBusy(true); setError("");
    try { const r = await fetch(`/api/cars/${id}/images`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url:imageUrl.trim(), isPrimary:images.length===0}) }); const d=await r.json(); if(!r.ok){setError(d.error||"Could not add image");return;} setImages(v=>[...v,d.image]); setImageUrl(""); } finally { setImageBusy(false); }
  };

  const uploadImage = async (file: File) => {
    setImageBusy(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isPrimary", String(images.length === 0));
      const r = await fetch(`/api/cars/${id}/images`, { method: "POST", body: formData });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error || "Could not upload image"); return; }
      setImages(v => [...v, d.image]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally { setImageBusy(false); }
  };

  const deleteImage = async (imageId:string) => {
    if (!confirm("Delete this image?")) return; const r=await fetch(`/api/cars/${id}/images`, {method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageId})}); if(r.ok) setImages(v=>v.filter(x=>x.id!==imageId));
  };
  const makePrimary = async (imageId:string) => { const r=await fetch(`/api/cars/${id}/images`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageId})}); if(r.ok) setImages(v=>v.map(x=>({...x,isPrimary:x.id===imageId}))); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PUT",
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
      router.push(`/cars/${id}`);
    } finally { setSaving(false); }
  };

  if (!form) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;

  const Field = ({ label, name, type="text", min, step, opts }: {label:string;name:string;type?:string;min?:string;step?:string;opts?:string[]}) => (
    <div>
      <label className="label">{label}</label>
      {opts
        ? <select className="input" value={form[name] as string} onChange={e => set(name, e.target.value)}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        : <input type={type} min={min} step={step} className="input" value={form[name] as string}
            onChange={e => set(name, type==="number" ? Number(e.target.value) : e.target.value)} />}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/cars/${id}`} className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="page-title">Edit Car</h1>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Vehicle Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Car Name *" name="name" />
            <Field label="Make *" name="make" />
            <Field label="Model *" name="model" />
            <Field label="Year *" name="year" type="number" min="1980" />
            <Field label="Color *" name="color" />
            <Field label="Plate *" name="plate" />
            <Field label="VIN (optional)" name="vin" />
            <Field label="Fuel Type" name="fuelType" opts={FUEL_TYPES} />
            <Field label="Transmission" name="transmission" opts={TRANSMISSIONS} />
            <Field label="Seats" name="seats" type="number" min="1" />
            <Field label="Mileage (km)" name="mileage" type="number" min="0" />
            <Field label="Status" name="status" opts={STATUSES} />
          </div>
          <div><label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description as string} onChange={e => set("description", e.target.value)} /></div>
        </div>
        <div className="card space-y-4">
          <div><h2 className="font-semibold">Vehicle Photos</h2><p className="mt-1 text-sm text-slate-500">Add image URLs, choose the main photo, or remove old photos.</p></div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="input" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://example.com/car-photo.jpg" />
            <button type="button" onClick={addImage} disabled={imageBusy||!imageUrl.trim()} className="btn-primary"><ImagePlus className="h-4 w-4" />{imageBusy?"Adding...":"Add Photo"}</button>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="vehicle-image-upload" className={`btn-secondary cursor-pointer justify-center ${imageBusy ? "pointer-events-none opacity-60" : ""}`}>
                <ImagePlus className="h-4 w-4" />{imageBusy ? "Uploading..." : "Upload from device"}
              </label>
              <input id="vehicle-image-upload" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                disabled={imageBusy}
                onChange={e=>{ const file=e.target.files?.[0]; if(file) uploadImage(file); e.currentTarget.value=""; }} />
              <span className="text-sm text-slate-500">Choose a JPG, PNG or WEBP image (max 2 MB). It uploads automatically.</span>
            </div>
          </div>
          {images.length>0 && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{images.map(img=><div key={img.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><img src={img.url} alt="Vehicle" className="h-36 w-full object-cover" />{img.isPrimary && <span className="absolute left-2 top-2 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white"><Star className="mr-1 inline h-3 w-3 fill-current"/>Main</span>}<div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><button type="button" onClick={()=>makePrimary(img.id)} className="btn-secondary btn-sm flex-1" disabled={img.isPrimary}>Main</button><button type="button" onClick={()=>deleteImage(img.id)} className="btn-danger btn-sm"><Trash2 className="h-3.5 w-3.5"/></button></div></div>)}</div>}
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold">Pricing (IQD)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Daily *" name="dailyPrice" type="number" min="0" step="500" />
            <Field label="Weekly" name="weeklyPrice" type="number" min="0" step="1000" />
            <Field label="Monthly" name="monthlyPrice" type="number" min="0" step="1000" />
            <Field label="Custom" name="customPrice" type="number" min="0" step="500" />
          </div>
          <Field label="Deposit" name="deposit" type="number" min="0" step="1000" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}</button>
          <Link href={`/cars/${id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}