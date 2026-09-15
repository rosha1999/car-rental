"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Users } from "lucide-react";

const INIT = { fullName:"", phone:"", altPhone:"", address:"", licenseNumber:"", licenseExpiry:"", nationality:"", notes:"" };

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, licenseExpiry: form.licenseExpiry || null }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error?.formErrors?.join(", ") || d.error || "Failed"); return; }
      router.push(`/customers/${d.customer.id}`);
    } finally { setSaving(false); }
  };

  const F = ({ label, name, type="text", required=false, placeholder="" }: {label:string;name:keyof typeof INIT;type?:string;required?:boolean;placeholder?:string}) => (
    <div><label className="label">{label}{required && " *"}</label>
      <input type={type} value={form[name]} onChange={e => set(name, e.target.value)} className="input" placeholder={placeholder} required={required} /></div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3"><Link href="/customers" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link><h1 className="page-title flex gap-2 items-center"><Users className="w-6 h-6" />New Customer</h1></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Full Name" name="fullName" required placeholder="Ahmed Ali" />
            <F label="Phone" name="phone" required type="tel" placeholder="07XX XXX XXXX" />
            <F label="Alt Phone" name="altPhone" type="tel" />
            <F label="Nationality" name="nationality" placeholder="Iraqi" />
            <F label="Driver License" name="licenseNumber" />
            <F label="License Expiry" name="licenseExpiry" type="date" />
          </div>
          <F label="Address" name="address" placeholder="Baghdad, Iraq" />
          <div><label className="label">Notes</label><textarea className="input h-20 resize-none" value={form.notes} onChange={e => set("notes",e.target.value)} /></div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4" />{saving ? "Saving...":"Save Customer"}</button>
          <Link href="/customers" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}