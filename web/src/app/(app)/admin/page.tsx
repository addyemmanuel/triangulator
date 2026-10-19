"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.adminUsers(), api.adminRoles(), api.adminIntegrations(), api.audit()])
      .then(([u, r, i, a]) => { setUsers(u); setRoles(r); setIntegrations(i); setAudit(a); });
  }, []);

  return (
    <div className="page">
      <PageHeader crumbs={["GOVERNANCE", "ADMINISTRATION"]} title="Administration"
        description="Administrative overview. Separate shell from investigator tooling." />

      <div className="strip" style={{ marginBottom: 18 }}>
        <div className="cell"><div className="k">Users</div><div className="v">{users.length || "—"}</div></div>
        <div className="cell"><div className="k">Roles</div><div className="v">{roles.length || "—"}</div></div>
        <div className="cell"><div className="k">Suspended accounts</div><div className="v">{users.filter(u => u.status === "suspended").length || 0}</div></div>
        <div className="cell"><div className="k">API connections</div><div className="v">{integrations.length || "—"}</div></div>
        <div className="cell"><div className="k">Audit events</div><div className="v">{audit.length || "—"}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <section className="panel">
          <div className="panel-h"><h3>User Activity</h3><Link className="btn ghost sm" href="/admin/users">Manage users</Link></div>
          <table className="table">
            <thead><tr><th>Badge</th><th>Name</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>{users.slice(0, 6).map(u => (
              <tr key={u.id}><td className="mono">{u.badge}</td><td>{u.name}</td><td>{u.roleName}</td>
                <td><Badge tone={u.status === "active" ? "ok" : u.status === "suspended" ? "crit" : "neutral"}>{u.status}</Badge></td></tr>
            ))}</tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panel-h"><h3>System Integrations</h3><Link className="btn ghost sm" href="/admin/integrations">View gateway</Link></div>
          <div className="panel-b" style={{ display: "grid", gap: 10 }}>
            {integrations.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>{i.provider}</span>
                <Badge tone={i.status === "operational" ? "ok" : i.status === "degraded" ? "warn" : "crit"}>{i.status}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-h"><h3>Access Changes</h3></div>
          <table className="table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Result</th></tr></thead>
            <tbody>{audit.filter(a => a.action.startsWith("admin") || a.action.startsWith("session")).slice(0, 6).map(a => (
              <tr key={a.id}><td className="mono tnum">{a.timestamp.slice(0,16).replace("T"," ")}</td><td className="mono">{a.user}</td><td>{a.action}</td>
                <td><Badge tone={a.result === "success" ? "ok" : "warn"}>{a.result}</Badge></td></tr>
            ))}</tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panel-h"><h3>Compliance Events</h3><Link className="btn ghost sm" href="/admin/compliance">Open vault</Link></div>
          <div className="panel-b" style={{ display: "grid", gap: 8 }}>
            {["Authorization verified — AUTH-DEMO-2026-0041",
              "Evidence sealed — EVD-0001",
              "Read-only archive opened — CASE-2025-9501Z",
              "Policy event: role permissions reviewed"].map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>{t}</span><Badge tone="ok">logged</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}