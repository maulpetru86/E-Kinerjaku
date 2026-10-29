"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PerformancePeriod } from "@/types";

interface ActivePeriodContextType {
  periods: PerformancePeriod[];
  activePeriod: PerformancePeriod | null;
  isLoading: boolean;
  setActivePeriodId: (id: string) => void;
  refreshPeriods: () => Promise<void>;
}

const ActivePeriodContext = createContext<ActivePeriodContextType | undefined>(undefined);

export function ActivePeriodProvider({ children }: { children: React.ReactNode }) {
  const [periods, setPeriods] = useState<PerformancePeriod[]>([]);
  const [activePeriodId, setActivePeriodIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kinerjaku_active_period");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshPeriods = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/periods");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPeriods(json.data);
        setActivePeriodIdState((prev) => {
          if (prev && json.data.some((p: PerformancePeriod) => p.id === prev)) {
            return prev;
          }
          const active = json.data.find((p: PerformancePeriod) => p.status === "active") || json.data[0];
          return active ? active.id : null;
        });
      }
    } catch (err) {
      console.error("Gagal memuat data periode:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/periods");
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          setPeriods(json.data);
          setActivePeriodIdState((prev) => {
            if (prev && json.data.some((p: PerformancePeriod) => p.id === prev)) {
              return prev;
            }
            const active = json.data.find((p: PerformancePeriod) => p.status === "active") || json.data[0];
            return active ? active.id : null;
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Gagal memuat data periode:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const setActivePeriodId = (id: string) => {
    setActivePeriodIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("kinerjaku_active_period", id);
    }
  };

  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0] || null;

  return (
    <ActivePeriodContext.Provider
      value={{
        periods,
        activePeriod,
        isLoading,
        setActivePeriodId,
        refreshPeriods,
      }}
    >
      {children}
    </ActivePeriodContext.Provider>
  );
}

export function useActivePeriod() {
  const context = useContext(ActivePeriodContext);
  if (!context) {
    throw new Error("useActivePeriod harus digunakan di dalam ActivePeriodProvider");
  }
  return context;
}
