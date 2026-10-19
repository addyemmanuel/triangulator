"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FilePlus2, FolderOpen, Archive, Smartphone, Network,
  RadioTower, Crosshair, Activity, Clock, ShieldAlert, FileLock2, ScrollText,
  HelpCircle, Server, UserCircle2, ShieldCheck
} from "lucide-react";

const sections = [
  { label: "CASE MANAGEMENT", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cases/new", label: "New Investigation", icon: FilePlus2 },
    { href: "/cases", label: "Active Cases", icon: FolderOpen },
    { href: "/cases/archive", label: "Closed Archives", icon: Archive }
  ]},
  { label: "INTELLIGENCE", items: [
    { href: "/intelligence/device", label: "Device Profiler", icon: Smartphone },
    { href: "/intelligence/identity", label: "Identity Linker", icon: Network },
    { href: "/intelligence/cells", label: "Cell-Site Mapping", icon: RadioTower }
  ]},
  { label: "INVESTIGATION", items: [
    { href: "/cases/CASE-2026-9941A", label: "Target Workspace", icon: Crosshair },
    { href: "/investigation/events", label: "Network Events", icon: Activity },
    { href: "/investigation/timeline", label: "Timeline", icon: Clock },
    { href: "/investigation/anomalies", label: "Risk & Anomalies", icon: ShieldAlert },
    { href: "/investigation/evidence", label: "Evidence", icon: FileLock2 }
  ]},
  { label: "GOVERNANCE", items: [
    { href: "/governance/audit", label: "Audit Trail", icon: ScrollText },
    { href: "/admin", label: "Administration", icon: ShieldCheck }
  ]}
];

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || (href !== "/" && path?.startsWith(href) && href !== "/cases");
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      {sections.map(s => (
        <div key={s.label} className="section">
          <div className="lbl">{s.label}</div>
          {s.items.map(it => {
            const Icon = it.icon;
            const active = isActive(it.href);
            return (
              <Link key={it.href} href={it.href} onClick={onNavigate} className={`item ${active ? "active" : ""}`}>
                <Icon size={13} /> {it.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="foot">
        <a className="item" href="#"><HelpCircle size={13} /> Help</a>
        <a className="item" href="/admin/integrations"><Server size={13} /> System status</a>
        <a className="item" href="/admin/users"><UserCircle2 size={13} /> User profile</a>
      </div>
    </aside>
  );
}