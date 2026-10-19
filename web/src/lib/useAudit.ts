"use client";
import { useCallback } from "react";
import { api } from "./api";

export function useAudit() {
  return useCallback(async (event: {
    action: string; caseId?: string; query?: string;
    dataSource?: string; authorization?: string;
    result?: "success"|"denied"|"error";
  }) => {
    try { await api.emitAudit(event); }
    catch { /* audit failure must not break the demo UI */ }
  }, []);
}