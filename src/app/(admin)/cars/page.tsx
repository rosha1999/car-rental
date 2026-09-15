"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, RefreshCw, Car } from "lucide-react";
import { formatIQD, carStatusColor, cn } from "@/lib/utils";
import type { Car as CarType } from "@/types";

export default function CarsPage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "table">("grid");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q, ...(status && { status }) });
    try {
      const r = await fetch(`/api/cars?${params}`);
      const d = await r.json();
      setCars(d.cars ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    } finally { setLoading(false); }
  }, [page, q, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone for cars without history.`)) return;
    setDeleting(id);
    try {
      const r = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) { alert(d.error); return; }
      load();
    } finally { setDeleting(null); }
  };

  const STATUSES = ["", "AVAILABLE", "RENTED", "RESERVED", "MAINTENANCE", "INACTIVE"];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cars</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total</p>
        </div>
        <Link href="/cars/new" className="btn-primary"><Plus className="w-4 h-4" />Add Car</Link>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search cars..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
              className="input pl-9" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
            {STATUSES.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-sm", view === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}>Grid</button>
            <button onClick={() => setView("table")} className={cn("px-3 py-2 text-sm", view === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}>Table</button>
          </div>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400 animate-pulse">Loading...</div> : (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Image */}
                <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0].url} alt={car.name} className="w-full h-full object-cover" />
                  ) : <Car className="w-12 h-12 text-gray-300" />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{car.name}</h3>
                    <span className={cn("badge ml-1", carStatusColor(car.status))}>{car.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{car.plate} &bull; {car.year} &bull; {car.color}</p>
                  <p className="text-sm font-bold text-blue-600">{formatIQD(car.dailyPrice)}<span className="font-normal text-gray-400 text-xs">/day</span></p>
                  <div className="flex gap-1 mt-3">
                    <Link href={`/cars/${car.id}`} className="btn btn-secondary btn-sm flex-1 justify-center"><Eye className="w-3 h-3" /></Link>
                    <Link href={`/cars/${car.id}/edit`} className="btn btn-secondary btn-sm flex-1 justify-center"><Edit className="w-3 h-3" /></Link>
                    <button onClick={() => handleDelete(car.id, car.name)} disabled={deleting === car.id}
                      className="btn btn-danger btn-sm flex-1 justify-center"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {cars.length === 0 && <div className="col-span-full text-center py-16 text-gray-400">No cars found</div>}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Car</th><th>Plate</th><th>Year</th><th>Status</th><th>Daily Price</th><th>Mileage</th><th>Actions</th></tr></thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id}>
                    <td><div className="font-medium">{car.name}</div><div className="text-xs text-gray-400">{car.make} {car.model}</div></td>
                    <td className="font-mono text-xs">{car.plate}</td>
                    <td>{car.year}</td>
                    <td><span className={cn("badge", carStatusColor(car.status))}>{car.status}</span></td>
                    <td className="font-medium">{formatIQD(car.dailyPrice)}</td>
                    <td>{car.mileage.toLocaleString()} km</td>
                    <td><div className="flex gap-1">
                      <Link href={`/cars/${car.id}`} className="btn btn-secondary btn-sm"><Eye className="w-3 h-3" /></Link>
                      <Link href={`/cars/${car.id}/edit`} className="btn btn-secondary btn-sm"><Edit className="w-3 h-3" /></Link>
                      <button onClick={() => handleDelete(car.id, car.name)} disabled={deleting === car.id}
                        className="btn btn-danger btn-sm"><Trash2 className="w-3 h-3" /></button>
                    </div></td>
                  </tr>
                ))}
                {cars.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No cars found</td></tr>}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="btn-secondary btn-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page >= pages} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}