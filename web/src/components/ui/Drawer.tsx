"use client";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (<>
    <div className="drawer-scrim" onClick={onClose} />
    <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="h">
        <h3 className="label" style={{ margin: 0 }}>{title}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={14} /></button>
      </div>
      <div className="b">{children}</div>
    </aside>
  </>);
}