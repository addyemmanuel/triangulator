"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Lock, ShieldCheck, Menu } from "lucide-react";
import { useSession } from "@/lib/session";
import { api } from "@/lib/api";

type R = { cases: any[]; targets: any[]; devices: any[]; events: any[]; audit: any[] };

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { lock } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<R | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    const t = setTimeout(async () => { try { setRes(await api.search(q)); } catch {} }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function nav(path: string) { setOpen(false); setQ(""); router.push(path); }

  return (
    <header className="topbar">
      <div className="brand">
        <button className="icon-btn menu-btn" aria-label="Toggle navigation" onClick={onMenu}><Menu size={14} /></button>
        <span className="name">IMEI TRIANGULATOR DEMO</span>

        <span className="case-pill"><span className="dot" /> CASE: 2026-9941A</span>
      </div>

      <div className="search" ref={box}>
        <span className="i"><Search size={13} /></span>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search IMEI, MSISDN, Case ID, Target…"
          aria-label="Global search"
        />
        {open && res && (
          <div className="results">
            {(["cases","targets","devices","events","audit"] as const).map(k => res[k]?.length ? (
              <div key={k} className="grp">
                <div className="label" style={{ padding: "4px 8px" }}>{k}</div>
                {res[k].map((r: any) => {
                  const label = r.id ?? r.imei ?? r.action;
                  const sub = r.title ?? r.label ?? r.model ?? r.cellId ?? r.dataSource;
                  const path = k === "cases" ? `/cases/${r.id}` :
                               k === "targets" ? `/cases/${r.caseId}` :
                               k === "devices" ? `/intelligence/device?imei=${r.imei}` :
                               k === "events" ? `/investigation/events` :
                               `/governance/audit`;
                  return <div key={label} className="item" onClick={() => nav(path)}>
                    <span className="mono">{label}</span><span className="muted">{sub}</span>
                  </div>;
                })}
              </div>
            ) : null)}
          </div>
        )}
      </div>

      <div className="right">
     
        <div className="user">
          <span className="n">A. ADEYEMI</span>
          <span className="r">INVESTIGATOR</span>
        </div>
        <button className="icon-btn" onClick={lock} aria-label="Emergency session lock">
          <Lock size={12} /> LOCK
        </button>
      </div>
    </header>
  );
}