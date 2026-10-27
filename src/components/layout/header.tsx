"use client";

import Link from "next/link";
import { useActivePeriod } from "@/contexts/active-period-context";
import { PlusCircle, Upload, Calendar, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { periods, activePeriod, setActivePeriodId } = useActivePeriod();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Title or Active Period Switcher */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <span className="font-bold text-white text-base">KinerjaKu</span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              aria-label="Pilih Periode Kinerja"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[140px] sm:max-w-[200px] truncate">
                {activePeriod ? activePeriod.name : "Pilih Periode"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-slate-850 border border-slate-700 bg-slate-900 shadow-xl shadow-black/40 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Pilih Periode Kinerja
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {periods.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400">Tidak ada periode</div>
                  ) : (
                    periods.map((p) => {
                      const isSelected = activePeriod?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActivePeriodId(p.id);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800 transition-colors",
                            isSelected ? "text-emerald-400 font-semibold bg-emerald-500/10" : "text-slate-300"
                          )}
                        >
                          <div>
                            <div className="font-medium truncate max-w-[180px]">{p.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {p.startDate} s/d {p.endDate}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="p-1.5 border-t border-slate-800">
                  <Link
                    href="/periode"
                    onClick={() => setDropdownOpen(false)}
                    className="block text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 py-1 rounded hover:bg-slate-800/80"
                  >
                    + Kelola Semua Periode
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/bukti/inbox"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Unggah Bukti</span>
          </Link>

          <Link
            href="/aktivitas/catat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors shadow-sm shadow-emerald-700/30"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>Catat Aktivitas</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
