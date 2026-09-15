"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye } from "lucide-react";
import { formatIQD, formatDate, rentalStatusColor, cn } from "@/lib/utils";
const STATUSES=["","ACTIVE","RESERVED","OVERDUE","COMPLETED","CANCELLED"];
export default function RentalsPage() {
  const [rentals, setRentals] = useState<Record<string,unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const load = useCallback(async() => {
    setLoading(true);
    const p=new URLSearchParams({page:String(page),q,...(status&&{status})});
    try{const r=await fetch(`/api/rentals?${p}`);const d=await r.json();setRentals(d.rentals??[]);setTotal(d.total??0);setPages(d.pages??1);}finally{setLoading(false);}
  },[page,q,status]);
  useEffect(()=>{load();},[load]);
  return(<div className="space-y-6">
    <div className="page-header">
      <div><h1 className="page-title">Rentals</h1><p className="text-sm text-gray-500">{total} total</p></div>
      <Link href="/rentals/new" className="btn-primary"><Plus className="w-4 h-4"/>New Rental</Link>
    </div>
    <div className="card py-4"><div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input placeholder="Search..." value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} className="input pl-9"/></div>
      <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="input w-auto">
        {STATUSES.map(s=><option key={s} value={s}>{s||"All Statuses"}</option>)}
      </select>
    </div></div>
    {loading?<div className="text-center py-12 text-gray-400 animate-pulse">Loading...</div>:(
      <div className="table-container"><table>
        <thead><tr><th>#</th><th>Car</th><th>Customer</th><th>Start</th><th>End</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead>
        <tbody>{(rentals as {id:string;rentalNumber:string;car:{name:string;plate:string};customer:{fullName:string};startDate:string;endDate:string;totalPrice:number;additionalCharges:number;lateFee:number;payments:{amount:number}[];status:string}[]).map(r=>{
          const paid=(r.payments??[]).reduce((s,p)=>s+p.amount,0);
          const tot=(r.totalPrice||0)+(r.additionalCharges||0)+(r.lateFee||0);
          const bal=Math.max(0,tot-paid);
          return(<tr key={r.id}>
            <td className="font-mono text-xs"><Link href={`/rentals/${r.id}`} className="text-blue-600 hover:underline">{r.rentalNumber}</Link></td>
            <td><div className="font-medium text-sm">{r.car?.name}</div><div className="text-xs text-gray-400">{r.car?.plate}</div></td>
            <td className="text-sm">{r.customer?.fullName}</td>
            <td className="text-xs">{formatDate(r.startDate)}</td>
            <td className="text-xs">{formatDate(r.endDate)}</td>
            <td className="font-medium">{formatIQD(tot)}</td>
            <td className={paid>=tot?"text-green-600":"text-gray-700"}>{formatIQD(paid)}</td>
            <td className={bal>0?"text-red-600 font-medium":"text-gray-400"}>{formatIQD(bal)}</td>
            <td><span className={cn("badge",rentalStatusColor(r.status))}>{r.status}</span></td>
            <td><Link href={`/rentals/${r.id}`} className="btn btn-secondary btn-sm"><Eye className="w-3 h-3"/></Link></td>
          </tr>);
        })}
        {rentals.length===0&&<tr><td colSpan={10} className="text-center py-8 text-gray-400">No rentals found</td></tr>}
        </tbody></table></div>
    )}
    {pages>1&&<div className="flex items-center justify-center gap-2">
      <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="btn-secondary btn-sm">Prev</button>
      <span className="text-sm">{page}/{pages}</span>
      <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} className="btn-secondary btn-sm">Next</button>
    </div>}
  </div>);
}