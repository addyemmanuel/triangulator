"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Selection = {
  caseId: string;
  targetId: string;
  selectedEventId: string | null;
  selectedCellId: string | null;
};

type Ctx = Selection & {
  setCase: (caseId: string) => void;
  setTarget: (targetId: string) => void;
  selectEvent: (id: string | null) => void;
  selectCell: (id: string | null) => void;
  clear: () => void;
};

const DEFAULT: Selection = {
  caseId: "CASE-2026-9941A",
  targetId: "TARGET-001",
  selectedEventId: null,
  selectedCellId: null
};

const KEY = "imei-triangulator-selection";
const SelectionCtx = createContext<Ctx>({} as Ctx);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [sel, setSel] = useState<Selection>(DEFAULT);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setSel(s => ({ ...s, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(sel)); } catch { /* ignore */ }
  }, [sel]);

  return (
    <SelectionCtx.Provider value={{
      ...sel,
      setCase: (caseId) => setSel(s => ({ ...s, caseId })),
      setTarget: (targetId) => setSel(s => ({ ...s, targetId })),
      selectEvent: (selectedEventId) => setSel(s => ({ ...s, selectedEventId })),
      selectCell: (selectedCellId) => setSel(s => ({ ...s, selectedCellId })),
      clear: () => setSel(DEFAULT)
    }}>{children}</SelectionCtx.Provider>
  );
}

export const useInvestigation = () => useContext(SelectionCtx);