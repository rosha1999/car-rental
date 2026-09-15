
import type { ReactNode } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <PublicHeader />
    <main>{children}</main>
    <PublicFooter />
  </div>;
}
