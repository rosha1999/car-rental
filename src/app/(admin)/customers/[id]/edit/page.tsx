"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditCustomerPage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [form, setForm] = useState<Record<string,string>|null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/customers/${id}`).then(r=>r.json()).then(d=>{
      const c = d.customer;
      setForm({ fullName:c.fullName, phone:c.phone, altPhone:c.altPhone??"" ,address:c.address??"",licenseNumber:c.licenseNumber??"",licenseExpiry:c.licenseExpiry?new Date(c.licenseExpiry).toISOString().split("T")[0]:"",nationality:c.nationality??"",notes:c.notes??"" });
    });
  },[id]);

  const set = (k:string,v:string) => setForm(f=>f?{...f,[k]:v}:f);

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); if (!form) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/customers/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,licenseExpiry:form.licenseExpiry||null})});
      const d = await res.json();
      if (!res.ok){setError(d.error||"Failed");return;}
      router.push(`/customers/${id}`);
    } finally{setSaving(false);}
  };

  if (!form) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3"><Link href={`/customers/${id}`} className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link><h1 className="page-title">Edit Customer</h1></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{l:"Full Name *",k:"fullName"},{l:"Phone *",k:"phone"},{l:"Alt Phone",k:"altPhone"},{l:"Nationality",k:"nationality"},{l:"License #",k:"licenseNumber"},{l:"Address",k:"address"}].map(({l,k})=>(
            <div key={k}><label className="label">{l}</label><input className="input" value={form[k]} onChange={e=>set(k,e.target.value)} /></div>
          ))}
          <div><label className="label">License Expiry</label><input type="date" className="input" value={form.licenseExpiry} onChange={e=>set("licenseExpiry",e.target.value)} /></div>
        </div>
        <div><label className="label">Notes</label><textarea className="input h-20 resize-none" value={form.notes} onChange={e=>set("notes",e.target.value)} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4" />{saving?"Saving...":"Save"}</button>
          <Link href={`/customers/${id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}