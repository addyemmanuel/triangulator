"use client";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Modal({
  open, title, subtitle, onClose, footer, children
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
      >
        <div className="h">
          <div>
            <div className="t">{title}</div>
            {subtitle && <div className="s">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>
        <div className="b">{children}</div>
        {footer && <div className="f">{footer}</div>}
      </div>
    </div>
  );
}