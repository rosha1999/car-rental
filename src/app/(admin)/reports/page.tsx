"use client";
import { useEffect, useState } from "react";
import { BarChart3, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatIQD } from "@/lib/utils";

type ReportData = {
  summary: { totalRentals:number; totalRevenue:number; totalCollected:number; outstanding:number; avgRentalValue:number; newCustomers:number; };
  chartData: { label:string; revenue:number; collected:number; rentals:number; }[];
  topCars: { name:string; plate:string; count:number; revenue:number; }[];
  topCustomers: { fullName:string; phone:string; count:number; totalPaid:number; }[];
};

const PERIODS = [
  { label:"Today",       value:"daily"   },
  { label:"This Week",   value:"weekly"  },
  { label:"This Month",  value:"monthly" },
  { label:"Custom",      value:"custom"  },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<ReportData|null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ period, ...(period==="custom"&&startDate&&endDate?{startDate,endDate}:{}) });
      const r = await fetch(`/api/reports?${p}`);
      const d = await r.json();
      setData(d);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[period]);

  const exportCSV = (rows: Record<string,unknown>[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h=>JSON.stringify(r[h]??"")||'""').join(","))].join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename+".csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><BarChart3 className="w-6 h-6" />Reports</h1>
      </div>

      {/* Period Selector */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p=>(
            <button key={p.value} onClick={()=>setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period===p.value?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>{p.label}</button>
          ))}
          {period==="custom"&&(
            <>
              <input type="date" className="input w-auto" value={startDate} onChange={e=>setStartDate(e.target.value)} />
              <input type="date" className="input w-auto" value={endDate} onChange={e=>setEndDate(e.target.value)} />
              <button onClick={load} className="btn-primary btn-sm">Apply</button>
            </>
          )}
        </div>
      </div>

      {loading&&<div className="text-center py-12 text-gray-400 animate-pulse">Loading report...</div>}
      {!loading&&data&&(
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label:"Rentals",        value:String(data.summary.totalRentals),              color:"text-blue-700" },
              { label:"Revenue",        value:formatIQD(data.summary.totalRevenue),            color:"text-gray-900" },
              { label:"Collected",      value:formatIQD(data.summary.totalCollected),          color:"text-green-700" },
              { label:"Outstanding",    value:formatIQD(data.summary.outstanding),             color:"text-red-700" },
              { label:"Avg. Rental",    value:formatIQD(data.summary.avgRentalValue),          color:"text-purple-700" },
              { label:"New Customers",  value:String(data.summary.newCustomers),               color:"text-orange-700" },
            ].map(s=>(
              <div key={s.label} className="stat-card">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          {data.chartData.length>0&&(
            <div className="card">
              <h2 className="font-semibold mb-4">Revenue Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{top:0,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:11}} tickFormatter={(v)=>`${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v)=>formatIQD(v as number)} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Cars & Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Top Cars</h2>
                <button onClick={()=>exportCSV(data.topCars as unknown as Record<string,unknown>[],"top-cars")} className="btn-secondary btn-sm"><Download className="w-3 h-3" />CSV</button>
              </div>
              <div className="space-y-2">
                {data.topCars.map((c,i)=>(
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                    <div><span className="font-medium">{c.name}</span><span className="text-gray-400 text-xs ml-2">{c.plate}</span></div>
                    <div className="text-right"><div className="font-medium text-blue-600">{formatIQD(c.revenue)}</div><div className="text-xs text-gray-400">{c.count} rental{c.count!==1?"s":""}</div></div>
                  </div>
                ))}
                {data.topCars.length===0&&<p className="text-gray-400 text-sm">No data</p>}
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Top Customers</h2>
                <button onClick={()=>exportCSV(data.topCustomers as unknown as Record<string,unknown>[],"top-customers")} className="btn-secondary btn-sm"><Download className="w-3 h-3" />CSV</button>
              </div>
              <div className="space-y-2">
                {data.topCustomers.map((c,i)=>(
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                    <div><div className="font-medium">{c.fullName}</div><div className="text-xs text-gray-400">{c.phone}</div></div>
                    <div className="text-right"><div className="font-medium text-green-600">{formatIQD(c.totalPaid)}</div><div className="text-xs text-gray-400">{c.count} rental{c.count!==1?"s":""}</div></div>
                  </div>
                ))}
                {data.topCustomers.length===0&&<p className="text-gray-400 text-sm">No data</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}