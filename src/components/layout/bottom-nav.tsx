"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Plus, Inbox, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navs = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/aktivitas", icon: BookOpen },
    { name: "Catat", href: "/aktivitas/catat", icon: Plus, isAction: true },
    { name: "Bukti", href: "/bukti/inbox", icon: Inbox },
    { name: "Periode", href: "/periode", icon: Archive },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navs.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
                aria-label="Catat Cepat Aktivitas"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-950 group-active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 mt-1">Catat</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors text-[11px]",
                isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-emerald-400" : "text-slate-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
