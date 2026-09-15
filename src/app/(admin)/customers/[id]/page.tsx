"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, MapPin, FileText } from "lucide-react";
import { formatIQD, formatDate, rentalStatusColor, cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams<{id:string}>();
  const [customer, setCustomer] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${id}`).then(r=>r.json()).then(d=>setCustomer(d.customer)).finally(()=>setLoading(false));
  },[id]);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;
  if (!customer) return <div className="text-center py-20 text-red-500">Customer not found</div>;

  const rentals = (customer.rentals as unknown[]) ?? [];
  const totalPaid = rentals.reduce((s: number, r: unknown) => s + ((r as {payments:{amount:number}[]}).payments ?? []).reduce((ps: number, p: {amount:number}) => ps+p.amount, 0), 0);
  const totalRented = rentals.reduce((s: number, r: unknown) => s + ((r as Record<string,number>).totalPrice ?? 0), 0);
  const outstanding = Math.max(0, totalRented - totalPaid);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div><h1 className="page-title">{customer.fullName as string}</h1>{Boolean(customer.isArchived) && <span className="badge bg-gray-100 text-gray-500 text-xs">Archived</span>}</div>
        </div>
        <Link href={`/customers/${id}/edit`} className="btn-primary"><Edit className="w-4 h-4" />Edit</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-xs text-gray-500">Total Rented</p><p className="text-xl font-bold text-gray-900">{formatIQD(totalRented)}</p></div>
        <div className="stat-card"><p className="text-xs text-gray-500">Total Paid</p><p className="text-xl font-bold text-green-600">{formatIQD(totalPaid)}</p></div>
        <div className="stat-card"><p className="text-xs text-gray-500">Outstanding</p><p className={cn("text-xl font-bold", outstanding > 0 ? "text-red-600" : "text-gray-400")}>{formatIQD(outstanding)}</p></div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Customer Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ["Phone", customer.phone],["Alt Phone", customer.altPhone || "-"],["Nationality", customer.nationality || "-"],
            ["License #", customer.licenseNumber || "-"],["License Expiry", customer.licenseExpiry ? formatDate(customer.licenseExpiry as string) : "-"],
            ["Address", customer.address || "-"],["Added", formatDate(customer.createdAt as string)],
          ].map(([k,v]) => (
            <div key={k as string}><span className="text-gray-500 text-xs">{k as string}</span><p className="font-medium">{v as string}</p></div>
          ))}
        </div>
        {customer.notes && <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">{customer.notes as string}</div>}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Rental History ({rentals.length})</h2>
          <Link href={`/rentals/new?customerId=${id}`} className="btn-primary btn-sm">+ New Rental</Link>
        </div>
        {rentals.length === 0
          ? <p className="text-gray-400 text-sm">No rentals yet</p>
          : <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Car</th><th>Start</th><th>End</th><th>Total</th><th>Paid</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {(rentals as {id:string;rentalNumber:string;car:{name:string;plate:string};startDate:string;endDate:string;totalPrice:number;payments:{amount:number}[];status:string}[]).map(r=>{
                  const paid = r.payments.reduce((s,p)=>s+p.amount,0);
                  return <tr key={r.id}>
                    <td className="font-mono text-xs">{r.rentalNumber}</td>
                    <td>{r.car?.name} <span className="text-xs text-gray-400">({r.car?.plate})</span></td>
                    <td className="text-xs">{formatDate(r.startDate)}</td>
                    <td className="text-xs">{formatDate(r.endDate)}</td>
                    <td>{formatIQD(r.totalPrice)}</td>
                    <td className={paid>=r.totalPrice?"text-green-600":"text-orange-600"}>{formatIQD(paid)}</td>
                    <td><span className={cn("badge",rentalStatusColor(r.status))}>{r.status}</span></td>
                    <td><Link href={`/rentals/${r.id}`} className="text-blue-600 hover:underline text-xs">View</Link></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}