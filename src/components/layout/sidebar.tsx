"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  BookOpen,
  Target,
  FileCheck2,
  BarChart3,
  Archive,
  Settings,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivePeriod } from "@/contexts/active-period-context";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Catat Cepat", href: "/aktivitas/catat", icon: PlusCircle, highlight: true },
  { name: "Kotak Masuk Bukti", href: "/bukti/inbox", icon: Inbox },
  { name: "Jurnal Aktivitas", href: "/aktivitas", icon: BookOpen },
  { name: "Bank RHK", href: "/rhk", icon: Target },
  { name: "Bank Bukti Dukung", href: "/bukti", icon: FileCheck2 },
  { name: "Rekap Kinerja", href: "/rekap", icon: BarChart3 },
  { name: "Periode & Arsip", href: "/periode", icon: Archive },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  { name: "Panduan Guru (PDF)", href: "/panduan/cetak", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activePeriod } = useActivePeriod();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-200 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              KinerjaKu
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Pribadi
              </span>
            </h1>
            <p className="text-xs text-slate-400">Asisten Bukti e-Kinerja</p>
          </div>
        </div>

        {/* Info Periode Aktif di Sidebar */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Periode Aktif:</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                activePeriod?.status === "active"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-700 text-slate-300"
              )}
            >
              {activePeriod?.status === "active" ? "Aktif" : activePeriod?.status || "Belum Dipilih"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
            {activePeriod?.name || "Memuat periode..."}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                item.highlight && !isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  : isActive
                  ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        <p className="font-medium text-slate-400">Catat dahulu, rapikan kemudian</p>
        <p className="mt-0.5 text-slate-500">KinerjaKu v1.0 • Data Privat</p>
      </div>
    </aside>
  );
}
