"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatIQD, formatDate, reservationStatusColor, cn } from "@/lib/utils";

const STATUSES = ["","PENDING","CONFIRMED","CANCELLED","CONVERTED_TO_RENTAL"];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Record<string,unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(status && { status }) });
    try {
      const r = await fetch(`/api/reservations?${params}`);
      const d = await r.json();
      setReservations(d.reservations ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    } finally { setLoading(false); }
  },[page, status]);

  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    await fetch(`/api/reservations/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:newStatus})});
    load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Reservations</h1><p className="text-sm text-gray-500">{total} total</p></div>
        <button onClick={()=>setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" />New Reservation</button>
      </div>
      <div className="card py-4">
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="input w-auto">
          {STATUSES.map(s=><option key={s} value={s}>{s||"All Statuses"}</option>)}
        </select>
      </div>
      {loading ? <div className="text-center py-12 text-gray-400 animate-pulse">Loading...</div> : (
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Car</th><th>Customer</th><th>Start</th><th>End</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {(reservations as {id:string;reservationNumber:string;car:{name:string;plate:string};customer:{fullName:string};startDate:string;endDate:string;estimatedPrice:number;status:string}[]).map(r=>(
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.reservationNumber}</td>
                  <td><div className="font-medium text-sm">{r.car?.name}</div><div className="text-xs text-gray-400">{r.car?.plate}</div></td>
                  <td className="text-sm">{r.customer?.fullName}</td>
                  <td className="text-xs">{formatDate(r.startDate)}</td>
                  <td className="text-xs">{formatDate(r.endDate)}</td>
                  <td>{formatIQD(r.estimatedPrice)}</td>
                  <td><span className={cn("badge",reservationStatusColor(r.status))}>{r.status}</span></td>
                  <td><div className="flex gap-1">
                    {r.status==="PENDING"&&<button onClick={()=>updateStatus(r.id,"CONFIRMED")} className="btn btn-success btn-sm">Confirm</button>}
                    {["PENDING","CONFIRMED"].includes(r.status)&&<button onClick={()=>updateStatus(r.id,"CANCELLED")} className="btn btn-secondary btn-sm text-red-600">Cancel</button>}
                  </div></td>
                </tr>
              ))}
              {reservations.length===0&&<tr><td colSpan={8} className="text-center py-8 text-gray-400">No reservations found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {pages>1&&(
        <div className="flex items-center justify-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="btn-secondary btn-sm">Prev</button>
          <span className="text-sm">{page}/{pages}</span>
          <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
      {showForm&&<NewReservationModal onClose={()=>setShowForm(false)} onCreated={load} />}
    </div>
  );
}

function NewReservationModal({onClose, onCreated}: {onClose:()=>void;onCreated:()=>void}) {
  const [customers, setCustomers] = useState<{id:string;fullName:string;phone:string}[]>([]);
  const [cars, setCars] = useState<{id:string;name:string;plate:string;dailyPrice:number}[]>([]);
  const [form, setForm] = useState({customerId:"",carId:"",startDate:"",endDate:"",estimatedPrice:0,deposit:0,notes:""});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    fetch("/api/customers?limit=200").then(r=>r.json()).then(d=>setCustomers(d.customers??[]));
    fetch("/api/cars?status=AVAILABLE&limit=100").then(r=>r.json()).then(d=>setCars(d.cars??[]));
  },[]);

  const set = (k:string,v:string|number) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const r = await fetch("/api/reservations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d = await r.json();
      if (!r.ok){setError(d.error||"Failed");return;}
      onCreated(); onClose();
    } finally{setSaving(false);}
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="font-bold text-lg mb-4">New Reservation</h3>
        {error&&<div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Customer *</label>
            <select className="input" value={form.customerId} onChange={e=>set("customerId",e.target.value)} required>
              <option value="">Select customer...</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)}
            </select></div>
          <div><label className="label">Car *</label>
            <select className="input" value={form.carId} onChange={e=>set("carId",e.target.value)} required>
              <option value="">Select car...</option>
              {cars.map(c=><option key={c.id} value={c.id}>{c.name} ({c.plate})</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start *</label><input type="datetime-local" className="input" required value={form.startDate} onChange={e=>set("startDate",e.target.value)} /></div>
            <div><label className="label">End *</label><input type="datetime-local" className="input" required value={form.endDate} onChange={e=>set("endDate",e.target.value)} /></div>
            <div><label className="label">Est. Price (IQD)</label><input type="number" min="0" className="input" value={form.estimatedPrice} onChange={e=>set("estimatedPrice",Number(e.target.value))} /></div>
            <div><label className="label">Deposit (IQD)</label><input type="number" min="0" className="input" value={form.deposit} onChange={e=>set("deposit",Number(e.target.value))} /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e=>set("notes",e.target.value)} /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving?"Saving...":"Create Reservation"}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}