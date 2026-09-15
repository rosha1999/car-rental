"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, RotateCcw, Printer, CheckCircle } from "lucide-react";
import { formatIQD, formatDate, formatDateTime, rentalStatusColor, cn, daysRemaining, daysOverdue } from "@/lib/utils";

const PAY_METHODS = ["CASH","BANK_TRANSFER","OTHER"] as const;
const FUEL_LEVELS = ["Full","3/4","1/2","1/4","Empty"] as const;
const CONDITIONS = ["Excellent","Good","Fair","Poor"] as const;

export default function RentalDetailPage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [rental, setRental] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<typeof PAY_METHODS[number]>("CASH");
  const [payNote, setPayNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [returnData, setReturnData] = useState({ returnMileage:"", returnFuelLevel:"Full", returnCondition:"Good", returnDamageNotes:"", additionalCharges:0, lateFee:0, finalPayment:0, paymentMethod:"CASH", postReturnStatus:"AVAILABLE", depositReturned:false });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/rentals/${id}`);
    const d = await r.json();
    setRental(d.rental);
    setLoading(false);
  },[id]);

  useEffect(()=>{ load(); },[load]);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;
  if (!rental) return <div className="text-center py-20 text-red-500">Rental not found</div>;

  const payments = (rental.payments as {id:string;amount:number;paymentDate:string;method:string;notes?:string}[]) ?? [];
  const car = rental.car as Record<string,unknown>;
  const customer = rental.customer as Record<string,string>;
  const paid = payments.reduce((s,p)=>s+p.amount,0);
  const totalCost = (rental.totalPrice as number)+(rental.additionalCharges as number)+(rental.lateFee as number);
  const balance = Math.max(0, totalCost - paid);
  const dr = daysRemaining(rental.endDate as string);
  const isActive = ["ACTIVE","OVERDUE","RESERVED"].includes(rental.status as string);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rentalId:id,amount:payAmount,method:payMethod,notes:payNote})});
      if (r.ok) { setShowPayForm(false); setPayAmount(0); setPayNote(""); await load(); }
      else { const d = await r.json(); alert(d.error); }
    } finally { setSaving(false); }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch(`/api/rentals/${id}/return`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...returnData,returnMileage:returnData.returnMileage?Number(returnData.returnMileage):null})});
      if (r.ok) { setShowReturnForm(false); await load(); }
      else { const d = await r.json(); alert(d.error); }
    } finally { setSaving(false); }
  };

  const printContract = () => window.print();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/rentals" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title font-mono">{rental.rentalNumber as string}</h1>
            <span className={cn("badge",rentalStatusColor(rental.status as string))}>{rental.status as string}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={printContract} className="btn-secondary btn-sm"><Printer className="w-4 h-4" />Print</button>
          {isActive && (
            <>
              <button onClick={()=>setShowPayForm(true)} className="btn-success btn-sm"><DollarSign className="w-4 h-4" />Payment</button>
              <button onClick={()=>setShowReturnForm(true)} className="btn-primary btn-sm"><RotateCcw className="w-4 h-4" />Return</button>
            </>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {dr < 0 && isActive && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <p className="font-bold text-red-700">⚠️ OVERDUE — {daysOverdue(rental.endDate as string)} day(s) past return date</p>
        </div>
      )}
      {dr === 0 && isActive && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4">
          <p className="font-bold text-orange-700">🔔 Due today — Please process return</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car + Customer */}
        <div className="card space-y-3">
          <h2 className="font-semibold">Vehicle</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500 text-xs">Car</span><p className="font-medium">{car?.name as string}</p></div>
            <div><span className="text-gray-500 text-xs">Plate</span><p className="font-mono text-sm">{car?.plate as string}</p></div>
          </div>
          <Link href={`/cars/${car?.id}`} className="text-blue-600 text-sm hover:underline">View car →</Link>
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold">Customer</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500 text-xs">Name</span><p className="font-medium">{customer?.fullName}</p></div>
            <div><span className="text-gray-500 text-xs">Phone</span><p>{customer?.phone}</p></div>
          </div>
          <Link href={`/customers/${customer?.id}`} className="text-blue-600 text-sm hover:underline">View customer →</Link>
        </div>
      </div>

      {/* Rental Details */}
      <div className="card">
        <h2 className="font-semibold mb-4">Rental Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            ["Type",rental.rentalType],["Duration",`${rental.durationDays} days`],
            ["Start",formatDate(rental.startDate as string)],["End",formatDate(rental.endDate as string)],
            ["Remaining",dr<0?`OVERDUE ${-dr}d`:`${dr} days`],["Deposit",formatIQD(rental.deposit as number)],
          ].map(([k,v])=>(
            <div key={k as string}><span className="text-gray-500 text-xs">{k as string}</span>
              <p className={cn("font-medium",k==="Remaining"&&dr<0?"text-red-600":"")}>{v as string}</p></div>
          ))}
        </div>
        {rental.notes && <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">{rental.notes as string}</div>}
      </div>

      {/* Financial Summary */}
      <div className="card">
        <h2 className="font-semibold mb-4">Financial Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Base Price</span><span>{formatIQD(rental.basePrice as number)}</span></div>
          {(rental.discount as number)>0&&<div className="flex justify-between text-green-600"><span>Discount</span><span>- {formatIQD(rental.discount as number)}</span></div>}
          {(rental.additionalCharges as number)>0&&<div className="flex justify-between text-orange-600"><span>Additional Charges</span><span>+ {formatIQD(rental.additionalCharges as number)}</span></div>}
          {(rental.lateFee as number)>0&&<div className="flex justify-between text-red-600"><span>Late Fee</span><span>+ {formatIQD(rental.lateFee as number)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-blue-700">{formatIQD(totalCost)}</span></div>
          <div className="flex justify-between text-green-600 font-medium"><span>Total Paid</span><span>{formatIQD(paid)}</span></div>
          <div className={cn("flex justify-between font-bold text-base",balance>0?"text-red-600":"text-green-600")}>
            <span>Balance</span><span>{balance>0?formatIQD(balance):"PAID IN FULL ✓"}</span>
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Payment History ({payments.length})</h2>
          {isActive&&<button onClick={()=>setShowPayForm(true)} className="btn-success btn-sm"><DollarSign className="w-3 h-3" />Add Payment</button>}
        </div>
        {payments.length===0?<p className="text-gray-400 text-sm">No payments recorded</p>:(
          <div className="space-y-2">
            {payments.map((p,i)=>(
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div><p className="font-medium text-green-700">{formatIQD(p.amount)}</p><p className="text-xs text-gray-500">{formatDate(p.paymentDate)} &bull; {p.method}</p></div>
                {p.notes&&<p className="text-xs text-gray-500 ml-4">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Info (if completed) */}
      {rental.status==="COMPLETED"&&rental.actualReturnDate&&(
        <div className="card bg-green-50 border-green-200">
          <h2 className="font-semibold mb-3 text-green-800"><CheckCircle className="inline w-4 h-4 mr-1" />Vehicle Returned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              ["Return Date",formatDateTime(rental.actualReturnDate as string)],
              ["Fuel Level",rental.returnFuelLevel||"N/A"],["Condition",rental.returnCondition||"N/A"],
              ["Final Mileage",rental.returnMileage?`${(rental.returnMileage as number).toLocaleString()} km`:"N/A"],
            ].map(([k,v])=>(
              <div key={k as string}><span className="text-gray-500 text-xs">{k as string}</span><p className="font-medium">{v as string}</p></div>
            ))}
          </div>
          {rental.returnDamageNotes&&<p className="text-sm text-orange-700 mt-2">Damage: {rental.returnDamageNotes as string}</p>}
        </div>
      )}

      {/* Payment Modal */}
      {showPayForm&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Record Payment</h3>
            <div className="mb-2 text-sm text-gray-500">Remaining balance: <span className="font-bold text-red-600">{formatIQD(balance)}</span></div>
            <form onSubmit={handlePayment} className="space-y-3">
              <div><label className="label">Amount (IQD) *</label><input type="number" min="1" max={balance+1000000} className="input" required value={payAmount||""} onChange={e=>setPayAmount(Number(e.target.value))} /></div>
              <div><label className="label">Method</label><select className="input" value={payMethod} onChange={e=>setPayMethod(e.target.value as typeof PAY_METHODS[number])}>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label className="label">Notes</label><input className="input" value={payNote} onChange={e=>setPayNote(e.target.value)} /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving||payAmount<=0} className="btn-primary flex-1 justify-center">{saving?"Saving...":"Save Payment"}</button>
                <button type="button" onClick={()=>setShowPayForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnForm&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
            <h3 className="font-bold text-lg mb-4">Return Vehicle</h3>
            <form onSubmit={handleReturn} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Final Mileage (km)</label><input type="number" min="0" className="input" value={returnData.returnMileage} onChange={e=>setReturnData(d=>({...d,returnMileage:e.target.value}))} /></div>
                <div><label className="label">Fuel Level</label><select className="input" value={returnData.returnFuelLevel} onChange={e=>setReturnData(d=>({...d,returnFuelLevel:e.target.value}))}>{FUEL_LEVELS.map(f=><option key={f}>{f}</option>)}</select></div>
                <div><label className="label">Condition</label><select className="input" value={returnData.returnCondition} onChange={e=>setReturnData(d=>({...d,returnCondition:e.target.value}))}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label className="label">Additional Charges</label><input type="number" min="0" className="input" value={returnData.additionalCharges} onChange={e=>setReturnData(d=>({...d,additionalCharges:Number(e.target.value)}))} /></div>
                <div><label className="label">Late Fee</label><input type="number" min="0" className="input" value={returnData.lateFee} onChange={e=>setReturnData(d=>({...d,lateFee:Number(e.target.value)}))} /></div>
                <div><label className="label">Final Payment</label><input type="number" min="0" className="input" value={returnData.finalPayment} onChange={e=>setReturnData(d=>({...d,finalPayment:Number(e.target.value)}))} /></div>
              </div>
              <div><label className="label">Damage Notes</label><textarea className="input h-16 resize-none" value={returnData.returnDamageNotes} onChange={e=>setReturnData(d=>({...d,returnDamageNotes:e.target.value}))} /></div>
              <div><label className="label">Post-Return Status</label>
                <select className="input" value={returnData.postReturnStatus} onChange={e=>setReturnData(d=>({...d,postReturnStatus:e.target.value}))}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={returnData.depositReturned} onChange={e=>setReturnData(d=>({...d,depositReturned:e.target.checked}))} />
                Deposit returned to customer ({formatIQD(rental.deposit as number)})
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving?"Processing...":"Complete Return"}</button>
                <button type="button" onClick={()=>setShowReturnForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Contract */}
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white; } .card { border: 1px solid #ccc; page-break-inside: avoid; } }
      `}</style>
    </div>
  );
}