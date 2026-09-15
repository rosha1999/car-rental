"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { formatIQD } from "@/lib/utils";
import { calculatePrice } from "@/lib/pricing";
import type { Car, Customer } from "@/types";
const RENTAL_TYPES=["DAILY","WEEKLY","MONTHLY","CUSTOM"] as const;
const PAY_METHODS=["CASH","BANK_TRANSFER","OTHER"] as const;
export default function NewRentalPage() {
  const router=useRouter();
  const sp=useSearchParams();
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [cars,setCars]=useState<Car[]>([]);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [customerId,setCustomerId]=useState(sp.get("customerId")??"" );
  const [carId,setCarId]=useState("");
  const [rentalType,setRentalType]=useState<typeof RENTAL_TYPES[number]>("DAILY");
  const [startDate,setStartDate]=useState("");
  const [endDate,setEndDate]=useState("");
  const [initialPayment,setInitialPayment]=useState(0);
  const [paymentMethod,setPaymentMethod]=useState<typeof PAY_METHODS[number]>("CASH");
  const [discount,setDiscount]=useState(0);
  const [notes,setNotes]=useState("");
  const [cSearch,setCSearch]=useState("");
  useEffect(()=>{
    fetch("/api/customers?limit=200").then(r=>r.json()).then(d=>setCustomers(d.customers??[]));
    fetch("/api/cars?status=AVAILABLE&limit=100").then(r=>r.json()).then(d=>setCars(d.cars??[]));
  },[]);
  const selectedCar=cars.find(c=>c.id===carId);
  const pricing=selectedCar&&startDate&&endDate&&new Date(endDate)>new Date(startDate)
    ?calculatePrice({rentalType,startDate:new Date(startDate),endDate:new Date(endDate),dailyPrice:selectedCar.dailyPrice,weeklyPrice:selectedCar.weeklyPrice,monthlyPrice:selectedCar.monthlyPrice,customPrice:selectedCar.customPrice})
    :null;
  const totalPrice=Math.max(0,(pricing?.basePrice??0)-discount);
  const remaining=Math.max(0,totalPrice-initialPayment);
  const filteredCustomers=customers.filter(c=>!cSearch||c.fullName.toLowerCase().includes(cSearch.toLowerCase())||c.phone.includes(cSearch));
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setSaving(true);setError("");
    try{
      const res=await fetch("/api/rentals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({carId,customerId,startDate,endDate,rentalType,totalPrice,deposit:selectedCar?.deposit??0,discount,initialPayment,paymentMethod,notes})});
      const d=await res.json();
      if(!res.ok){setError(d.error||"Failed");return;}
      router.push(`/rentals/${d.rental.id}`);
    }finally{setSaving(false);}
  };
  return(<div className="max-w-3xl space-y-6">
    <div className="flex items-center gap-3"><Link href="/rentals" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4"/></Link><h1 className="page-title">New Rental</h1></div>
    {error&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-3">
        <h2 className="font-semibold">1. Select Customer</h2>
        <input placeholder="Search customer..." value={cSearch} onChange={e=>setCSearch(e.target.value)} className="input"/>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredCustomers.slice(0,15).map(c=>(<button type="button" key={c.id} onClick={()=>{setCustomerId(c.id);setCSearch(c.fullName);}}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${customerId===c.id?"bg-blue-50 border border-blue-300":"bg-gray-50 hover:bg-blue-50"}`}>
            <span className="font-medium">{c.fullName}</span> <span className="text-gray-500">{c.phone}</span>
          </button>))}
        </div>
      </div>
      <div className="card space-y-3">
        <h2 className="font-semibold">2. Select Car & Dates</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start *</label><input type="datetime-local" className="input" value={startDate} onChange={e=>setStartDate(e.target.value)} required/></div>
          <div><label className="label">End *</label><input type="datetime-local" className="input" value={endDate} onChange={e=>setEndDate(e.target.value)} required/></div>
        </div>
        <div><label className="label">Rental Type</label>
          <div className="flex gap-2">{RENTAL_TYPES.map(t=>(<button type="button" key={t} onClick={()=>setRentalType(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border ${rentalType===t?"bg-blue-600 text-white border-blue-600":"border-gray-200 hover:border-blue-300"}`}>{t}</button>))}</div>
        </div>
        <div><label className="label">Select Car *</label>
          <select className="input" value={carId} onChange={e=>setCarId(e.target.value)} required>
            <option value="">Choose a car...</option>
            {cars.map(c=><option key={c.id} value={c.id}>{c.name} ({c.plate}) — {formatIQD(c.dailyPrice)}/day</option>)}
          </select>
        </div>
      </div>
      {pricing&&<div className="card space-y-3">
        <h2 className="font-semibold">3. Pricing & Payment</h2>
        <div className="bg-blue-50 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between"><span>Duration</span><span className="font-medium">{pricing.durationDays} days</span></div>
          <div className="flex justify-between"><span>Base Price</span><span className="font-medium">{formatIQD(pricing.basePrice)}</span></div>
          <div className="flex justify-between"><span>Deposit</span><span>{formatIQD(selectedCar?.deposit??0)}</span></div>
          <div className="flex justify-between font-bold text-blue-700 border-t pt-2"><span>Total</span><span>{formatIQD(totalPrice)}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Discount (IQD)</label><input type="number" min="0" className="input" value={discount} onChange={e=>setDiscount(Number(e.target.value))}/></div>
          <div><label className="label">Initial Payment</label><input type="number" min="0" className="input" value={initialPayment} onChange={e=>setInitialPayment(Number(e.target.value))}/></div>
          <div><label className="label">Payment Method</label><select className="input" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value as typeof PAY_METHODS[number])}>{PAY_METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        {initialPayment>0&&<div className={`p-3 rounded-lg text-sm font-medium ${remaining<=0?"bg-green-50 text-green-700":"bg-orange-50 text-orange-700"}`}>Remaining: {formatIQD(remaining)}</div>}
        <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <button type="submit" disabled={saving||!customerId||!carId} className="btn-primary w-full justify-center py-3">
          <Save className="w-4 h-4"/>{saving?"Creating..":"Create Rental"}
        </button>
      </div>}
    </form>
  </div>);
}