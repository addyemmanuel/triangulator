"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Loading";
import { fullTime, relTime } from "@/lib/format";

export default function DashboardPage() {
  const [cases, setCases] = useState<any[] | null>(null);
  const [integrations, setIntegrations] = useState<any[] | null>(null);
  const [audit, setAudit] = useState<any[] | null>(null);

  useEffect(() => {
    Promise.all([api.cases(), api.adminIntegrations(), api.audit()]).then(([c, i, a]) => { setCases(c); setIntegrations(i); setAudit(a); });
  }, []);

  const active = cases?.filter(c => c.status === "active") ?? [];
  const targetCount = cases ? new Set(active.flatMap(c => c.targetIds)).size : 0;
  const pending = cases?.filter(c => c.status === "pending_review").length ?? 0;
  const anomalies = 6; const events = 22 * 3 + 15 * 3;

  return (
    <div className="page">
      <PageHeader
        crumbs={["CASE MANAGEMENT", "DASHBOARD"]}
        title="Investigation Overview"
        description="Cross-case operational summary. All data below is synthetic demo data."
        action={<Link className="btn primary" href="/cases/new">New Investigation</Link>}
      />

      <div className="strip" style={{ marginBottom: 20 }}>
        <div className="cell"><div className="k">Active Cases</div><div className="v">{cases ? active.length : "—"}</div><div className="s">{cases ? `${cases.length} total` : ""}</div></div>
        <div className="cell"><div className="k">Active Targets</div><div className="v">{targetCount || "—"}</div><div className="s">under monitoring</div></div>
        <div className="cell"><div className="k">Pending Reviews</div><div className="v">{pending || "—"}</div><div className="s">awaiting case manager</div></div>
        <div className="cell"><div className="k">Network Events</div><div className="v">{events}</div><div className="s">last 24h (synthetic)</div></div>
        <div className="cell"><div className="k">Anomaly Flags</div><div className="v">{anomalies}</div><div className="s">3 high severity</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, alignItems: "start" }}>
        <section className="panel">
          <div className="panel-h"><h3>Active Investigations</h3>
            <Link className="btn ghost sm" href="/cases">View all</Link></div>
          {!cases ? <SkeletonTable /> : (
            <table className="table">
              <thead><tr><th>Case ID</th><th>Target</th><th>Type</th><th>Status</th><th>Last event</th><th>Investigator</th><th></th></tr></thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.id}>
                    <td className="id">{c.id}</td>
                    <td className="mono">{c.targetIds[0]}</td>
                    <td>{c.purpose.split(" ").slice(0, 3).join(" ")}…</td>
                    <td>{c.status === "active" ? <Badge tone="acc"><StatusDot tone="acc" /> Active</Badge>
                        : c.status === "pending_review" ? <Badge tone="warn">Pending review</Badge>
                        : <Badge>Archived</Badge>}</td>
                    <td className="tnum">{fullTime(c.lastEventAt)}</td>
                    <td>{c.investigator}</td>
                    <td><Link className="btn ghost sm" href={`/cases/${c.id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section className="panel">
            <div className="panel-h"><h3>Investigation Activity</h3><span className="dim" style={{ fontSize: 11 }}>last 60 min</span></div>
            <div className="panel-b">
              {!audit ? <SkeletonTable rows={5} cols={2} /> : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                  {audit.slice(-6).reverse().map((a: any) => (
                    <li key={a.id} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 10, fontSize: 12 }}>
                      <span className="mono dim">{fullTime(a.timestamp).slice(11)}</span>
                      <span>{a.action.replace(/\./g, " ")} <span className="dim">· {a.dataSource}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-h"><h3>System Health</h3><span className="dim" style={{ fontSize: 11 }}>synthetic adapters</span></div>
            <div className="panel-b" style={{ display: "grid", gap: 8 }}>
              {!integrations ? <SkeletonTable rows={5} cols={2} /> : integrations.map((i: any) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span>{i.provider}</span>
                  <span className={`badge ${i.status === "operational" ? "ok" : i.status === "degraded" ? "warn" : "crit"}`}>
                    <span className={`dot ${i.status === "operational" ? "ok" : i.status === "degraded" ? "warn" : "crit"}`} />
                    {i.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="page-footer">
        <span>Data source: synthetic demo dataset</span>
        <span>Authorization: AUTH-DEMO-2026-0041</span>
        <span>Updated {relTime(new Date().toISOString())}</span>
      </div>
    </div>
  );
}