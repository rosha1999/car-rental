"use client";
import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";

const SETTING_GROUPS = [
  { key:"businessName",     label:"Business Name (Arabic)", type:"text", default:"شركة الرائد لتأجير السيارات" },
  { key:"businessNameEn", label:"Business Name (English)", type:"text", default:"ALRAID Car Rental" },
  { key:"businessPhone", label:"Business Phone", type:"text", default:"07701886516" },
  { key:"businessEmail", label:"Business Email", type:"email", default:"alraadkirkuk@gmail.com" },
  { key:"businessAddress", label:"Business Address (Arabic)", type:"text", default:"كركوك شارع قدس مقابل بوكس كافيه" },
  { key:"businessAddressEn", label:"Business Address (English)", type:"text", default:"Quds Street, opposite Box Cafe, Kirkuk, Iraq" },
  { key:"currency",         label:"Currency",               type:"text",   default:"IQD" },
  { key:"minRentalDays",    label:"Minimum Rental Days",    type:"number", default:"1" },
  { key:"gracePeriodHours", label:"Grace Period (hours)",   type:"number", default:"2" },
  { key:"lateFeePerDay",    label:"Late Fee Per Day (IQD)", type:"number", default:"0" },
  { key:"depositPolicy",    label:"Deposit Policy",         type:"text",   default:"Refundable on return" },
  { key:"rentalTerms",      label:"Rental Terms & Conditions", type:"textarea", default:"Standard rental terms apply." },
  { key:"whatsappNumber", label:"WhatsApp Number", type:"text", default:"9647701886516" },
  { key:"businessLogo", label:"Logo Path", type:"text", default:"/brand/alraid-logo.JPG" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/settings").then(r=>r.json()).then(d=>{
      const s: Record<string,string> = {};
      SETTING_GROUPS.forEach(g=>{ s[g.key] = d.settings?.[g.key] ?? g.default; });
      setSettings(s);
    }).finally(()=>setLoading(false));
  },[]);

  const set = (k:string, v:string) => setSettings(s=>({...s,[k]:v}));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try {
      const r = await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
      if (r.ok) { setSaved(true); setTimeout(()=>setSaved(false),3000); }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title flex items-center gap-2"><Settings className="w-6 h-6" />Settings</h1>
      {saved&&<div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">✓ Settings saved successfully</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="card space-y-4">
          <h2 className="font-semibold">Business & Brand Settings</h2>
          {SETTING_GROUPS.filter(g=>g.type!=="textarea").map(g=>(
            <div key={g.key}>
              <label className="label">{g.label}</label>
              <input type={g.type} className="input" value={settings[g.key]??""} onChange={e=>set(g.key,e.target.value)} />
            </div>
          ))}
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold">Legal</h2>
          {SETTING_GROUPS.filter(g=>g.type==="textarea").map(g=>(
            <div key={g.key}>
              <label className="label">{g.label}</label>
              <textarea className="input h-40 resize-none" value={settings[g.key]??""} onChange={e=>set(g.key,e.target.value)} />
            </div>
          ))}
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" />{saving?"Saving...":"Save Settings"}
        </button>
      </form>
    </div>
  );
}