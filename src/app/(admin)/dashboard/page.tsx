"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Users, DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, Plus } from "lucide-react";
import { formatIQD, formatDate, rentalStatusColor, cn } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<Record<string,unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard");
      const d = await r.json();
      setData(d);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500 animate-pulse">Loading dashboard...</div></div>;
  if (!data) return <div className="text-red-500">Failed to load dashboard</div>;

  const stats = [
    { label: "Total Cars",          value: data.totalCars,          icon: Car,          color: "text-blue-600 bg-blue-50" },
    { label: "Available",           value: data.availableCars,      icon: CheckCircle,  color: "text-green-600 bg-green-50" },
    { label: "Rented",              value: data.rentedCars,         icon: Car,          color: "text-orange-600 bg-orange-50" },
    { label: "Reserved",            value: data.reservedCars,       icon: Clock,        color: "text-yellow-600 bg-yellow-50" },
    { label: "Active Customers",    value: data.totalCustomers,     icon: Users,        color: "text-purple-600 bg-purple-50" },
    { label: "Today's Income",      value: formatIQD(data.todayIncome as number),   icon: DollarSign, color: "text-emerald-600 bg-emerald-50", wide: true },
    { label: "Monthly Income",      value: formatIQD(data.monthlyIncome as number), icon: TrendingUp, color: "text-blue-600 bg-blue-50",    wide: true },
    { label: "Outstanding",         value: formatIQD(data.outstandingPayments as number), icon: AlertTriangle, color: "text-red-600 bg-red-50", wide: true },
  ];

  const returns = (data.upcomingReturns as unknown[]) ?? [];
  const notifications = (data.notifications as unknown[]) ?? [];
  const recentRentals = (data.recentRentals as unknown[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/rentals/new" className="btn-primary btn-sm"><Plus className="w-4 h-4" />New Rental</Link>
          <Link href="/customers/new" className="btn-secondary btn-sm"><Plus className="w-4 h-4" />Add Customer</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{String(s.value)}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Returns */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Upcoming Returns
          </h2>
          {returns.length === 0
            ? <p className="text-gray-400 text-sm">No upcoming returns</p>
            : <div className="space-y-3">
              {(returns as {rentalId:string;carName:string;plate:string;customerName:string;endDate:string;daysRemaining:number;remainingBalance:number;status:string}[]).map(r => {
                const urgency = r.daysRemaining < 0
                  ? "border-red-400 bg-red-50"
                  : r.daysRemaining === 0
                  ? "border-orange-400 bg-orange-50"
                  : r.daysRemaining <= 2
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-green-200 bg-green-50";
                const badge = r.daysRemaining < 0
                  ? `OVERDUE ${-r.daysRemaining}d`
                  : r.daysRemaining === 0
                  ? "DUE TODAY"
                  : `${r.daysRemaining}d left`;
                const badgeColor = r.daysRemaining < 0
                  ? "bg-red-600 text-white"
                  : r.daysRemaining === 0
                  ? "bg-orange-500 text-white"
                  : r.daysRemaining <= 2
                  ? "bg-yellow-500 text-white"
                  : "bg-green-500 text-white";
                return (
                  <Link key={r.rentalId} href={`/rentals/${r.rentalId}`}
                    className={cn("flex items-center justify-between p-3 rounded-lg border-l-4 hover:opacity-80 transition", urgency)}>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{r.carName} <span className="text-gray-500">({r.plate})</span></p>
                      <p className="text-xs text-gray-600">{r.customerName}</p>
                      <p className="text-xs text-gray-500">Return: {formatDate(r.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn("badge text-xs", badgeColor)}>{badge}</span>
                      {r.remainingBalance > 0 && <p className="text-xs text-red-600 mt-1">{formatIQD(r.remainingBalance)} owed</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          }
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Notifications
          </h2>
          {notifications.length === 0
            ? <p className="text-gray-400 text-sm">All clear!</p>
            : <div className="space-y-2">
              {(notifications as {type:string;message:string;link?:string}[]).slice(0,8).map((n,i) => (
                <div key={i} className={cn("text-sm p-2 rounded-lg",
                  n.type === "danger" ? "bg-red-50 text-red-700"
                  : n.type === "warning" ? "bg-yellow-50 text-yellow-700"
                  : "bg-blue-50 text-blue-700")}>
                  {n.link ? <Link href={n.link} className="hover:underline">{n.message}</Link> : n.message}
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Recent Rentals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Rentals</h2>
          <Link href="/rentals" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Car</th><th>Customer</th><th>Start</th><th>End</th><th>Total</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {(recentRentals as {id:string;rentalNumber:string;car:{name:string;plate:string};customer:{fullName:string};startDate:string;endDate:string;totalPrice:number;payments:{amount:number}[];status:string}[]).map(r => {
                const paid = r.payments.reduce((s,p) => s + p.amount, 0);
                return (
                  <tr key={r.id}>
                    <td><Link href={`/rentals/${r.id}`} className="text-blue-600 hover:underline font-mono text-xs">{r.rentalNumber}</Link></td>
                    <td>{r.car.name} <span className="text-gray-400 text-xs">({r.car.plate})</span></td>
                    <td>{r.customer.fullName}</td>
                    <td className="text-xs">{formatDate(r.startDate)}</td>
                    <td className="text-xs">{formatDate(r.endDate)}</td>
                    <td className="font-medium">{formatIQD(r.totalPrice)}</td>
                    <td className={paid >= r.totalPrice ? "text-green-600" : "text-orange-600"}>{formatIQD(paid)}</td>
                    <td><span className={cn("badge", rentalStatusColor(r.status))}>{r.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}