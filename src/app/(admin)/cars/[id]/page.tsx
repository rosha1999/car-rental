"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Car, Fuel, Settings, Users, MapPin } from "lucide-react";
import { formatIQD, formatDate, formatDateTime, carStatusColor, rentalStatusColor, cn, daysRemaining } from "@/lib/utils";

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar] = useState<Record<string,unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/cars/${id}`).then(r => r.json()).then(d => setCar(d.car)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading...</div>;
  if (!car) return <div className="text-center py-20 text-red-500">Car not found</div>;

  const images = (car.images as {url:string}[]) ?? [];
  const rentals = (car.rentals as unknown[]) ?? [];
  const activeRental = rentals.find((r: unknown) => ["ACTIVE","OVERDUE","RESERVED"].includes((r as Record<string,string>).status)) as Record<string,unknown> | undefined;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/cars" className="btn-secondary btn-sm p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="page-title">{car.name as string}</h1>
          <span className={cn("badge", carStatusColor(car.status as string))}>{car.status as string}</span>
        </div>
        <Link href={`/cars/${id}/edit`} className="btn-primary"><Edit className="w-4 h-4" />Edit</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Gallery */}
        <div className="card">
          <div className="h-64 bg-gray-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
            {images.length > 0
              ? <img src={images[imgIdx]?.url} alt="Car" className="w-full h-full object-cover" />
              : <Car className="w-20 h-20 text-gray-300" />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn("w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0", i === imgIdx ? "border-blue-500" : "border-transparent")}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Vehicle Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Make", car.make], ["Model", car.model], ["Year", car.year],
              ["Color", car.color], ["Plate", car.plate], ["VIN", car.vin || "-"],
              ["Fuel", car.fuelType], ["Transmission", car.transmission], ["Seats", car.seats],
              ["Mileage", `${(car.mileage as number).toLocaleString()} km`],
            ].map(([k,v]) => (
              <div key={k as string}>
                <span className="text-gray-500 text-xs">{k as string}</span>
                <p className="font-medium text-gray-900">{v as string}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Pricing (IQD)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Daily", car.dailyPrice], ["Weekly", car.weeklyPrice || "-"],
                ["Monthly", car.monthlyPrice || "-"], ["Deposit", car.deposit],
              ].map(([k,v]) => (
                <div key={k as string}>
                  <span className="text-gray-500 text-xs">{k}</span>
                  <p className="font-medium text-blue-600">{typeof v === "number" ? formatIQD(v) : v as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Rental */}
      {activeRental && (
        <div className="card border-l-4 border-orange-400 bg-orange-50">
          <h2 className="font-semibold text-gray-900 mb-3">Currently Rented</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">Customer</span><p className="font-medium">{(activeRental.customer as Record<string,string>)?.fullName}</p></div>
            <div><span className="text-gray-500">Start</span><p className="font-medium">{formatDate(activeRental.startDate as string)}</p></div>
            <div><span className="text-gray-500">End</span><p className="font-medium">{formatDate(activeRental.endDate as string)}</p></div>
            <div><span className="text-gray-500">Remaining</span><p className={cn("font-bold", daysRemaining(activeRental.endDate as string) < 0 ? "text-red-600" : "text-orange-600")}>
              {daysRemaining(activeRental.endDate as string) < 0
                ? `OVERDUE ${-daysRemaining(activeRental.endDate as string)}d`
                : `${daysRemaining(activeRental.endDate as string)} days`}
            </p></div>
          </div>
          <div className="mt-3">
            <Link href={`/rentals/${activeRental.id}`} className="btn-primary btn-sm">View Rental</Link>
          </div>
        </div>
      )}

      {/* Rental History */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Rental History ({rentals.length})</h2>
        {rentals.length === 0
          ? <p className="text-gray-400 text-sm">No rental history</p>
          : <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Start</th><th>End</th><th>Total</th><th>Paid</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {(rentals as {id:string;rentalNumber:string;customer:{fullName:string};startDate:string;endDate:string;totalPrice:number;payments:{amount:number}[];status:string}[]).map(r => {
                  const paid = r.payments.reduce((s,p) => s+p.amount, 0);
                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-xs">{r.rentalNumber}</td>
                      <td>{r.customer.fullName}</td>
                      <td className="text-xs">{formatDate(r.startDate)}</td>
                      <td className="text-xs">{formatDate(r.endDate)}</td>
                      <td>{formatIQD(r.totalPrice)}</td>
                      <td className={paid >= r.totalPrice ? "text-green-600" : "text-orange-600"}>{formatIQD(paid)}</td>
                      <td><span className={cn("badge", rentalStatusColor(r.status))}>{r.status}</span></td>
                      <td><Link href={`/rentals/${r.id}`} className="text-blue-600 hover:underline text-xs">View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}