"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Car, Users, FileText, CalendarDays,
  BarChart3, Settings, LogOut, Menu, X, Bell, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cars",      icon: Car,             label: "Cars" },
  { href: "/customers", icon: Users,           label: "Customers" },
  { href: "/rentals",   icon: FileText,        label: "Rentals" },
  { href: "/reservations", icon: CalendarDays, label: "Reservations" },
  { href: "/calendar",  icon: CalendarDays,    label: "Calendar" },
  { href: "/reports",   icon: BarChart3,       label: "Reports" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex flex-col h-full", mobile && "pt-4")}>
      {/* Logo */}
      <div className="px-4 py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Car Rental</p>
            <p className="text-xs text-gray-500">Private Admin</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={() => mobile && setSidebarOpen(false)}
            className={cn("sidebar-link", pathname.startsWith(href) && "active")}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-200 mt-auto">
        {user && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="ltr">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full bg-white shadow-xl">
            <button className="absolute top-4 right-4 p-1" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name ?? ""}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}