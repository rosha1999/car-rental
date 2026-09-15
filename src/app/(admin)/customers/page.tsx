"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Archive } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q });
    try {
      const r = await fetch(`/api/customers?${params}`);
      const d = await r.json();
      setCustomers(d.customers ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    } finally { setLoading(false); }
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const archive = async (id: string, name: string) => {
    if (!confirm(`Archive ${name}?`)) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Customers</h1><p className="text-sm text-gray-500">{total} total</p></div>
        <Link href="/customers/new" className="btn-primary"><Plus className="w-4 h-4" />Add Customer</Link>
      </div>
      <div className="card py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Search by name, phone, or license..." value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            className="input pl-9 max-w-md" />
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400 animate-pulse">Loading...</div> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>License</th><th>Rentals</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.fullName}</Link>
                    {c.nationality && <span className="text-xs text-gray-400 block">{c.nationality}</span>}
                  </td>
                  <td>
                    <div>{c.phone}</div>
                    {c.altPhone && <div className="text-xs text-gray-400">{c.altPhone}</div>}
                  </td>
                  <td className="text-sm">{c.licenseNumber || "-"}</td>
                  <td className="text-center">{(c._count?.rentals ?? 0)}</td>
                  <td className="text-xs text-gray-500">{formatDate(c.createdAt)}</td>
                  <td><div className="flex gap-1">
                    <Link href={`/customers/${c.id}`} className="btn btn-secondary btn-sm"><Eye className="w-3 h-3" /></Link>
                    <Link href={`/customers/${c.id}/edit`} className="btn btn-secondary btn-sm"><Edit className="w-3 h-3" /></Link>
                    <button onClick={() => archive(c.id, c.fullName)} className="btn btn-secondary btn-sm text-orange-600"><Archive className="w-3 h-3" /></button>
                  </div></td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1} className="btn-secondary btn-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page>=pages} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}