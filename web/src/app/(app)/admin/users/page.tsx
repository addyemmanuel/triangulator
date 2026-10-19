"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";

export default function AdminUsers() {
  const [rows, setRows] = useState<any[]>([]);
  const [confirm, setConfirm] = useState<any | null>(null);
  useEffect(() => { api.adminUsers().then(setRows); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["ADMINISTRATION", "USERS"]} title="Users"
        description="Six demo users. Destructive actions require confirmation." />
      <section className="panel">
        <table className="table">
          <thead><tr><th>User</th><th>Badge</th><th>Role</th><th>Status</th><th>Last access</th><th>MFA</th><th>Actions</th></tr></thead>
          <tbody>{rows.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td className="mono">{u.badge}</td>
              <td>{u.roleName}</td>
              <td><Badge tone={u.status === "active" ? "ok" : u.status === "suspended" ? "crit" : "neutral"}>{u.status}</Badge></td>
              <td className="mono tnum">{fullTime(u.lastAccess)}</td>
              <td><Badge tone={u.mfa ? "ok" : "warn"}>{u.mfa ? "enabled" : "missing"}</Badge></td>
              <td>
                <button className="btn ghost sm">View</button>
                <button className="btn ghost sm">Edit</button>
                <button className="btn ghost sm" onClick={() => setConfirm({ action: "suspend", user: u })}>Suspend</button>
                <button className="btn ghost sm" onClick={() => setConfirm({ action: "revoke", user: u })}>Revoke</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      {confirm && (
        <div className="drawer-scrim" onClick={() => setConfirm(null)}>
          <div className="login-card" style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: 380, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <h2>Confirm {confirm.action}</h2>
            <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              You are about to {confirm.action} <strong className="mono">{confirm.user.badge}</strong>.
              A synthetic audit event will be recorded.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn danger" onClick={() => setConfirm(null)}>Confirm</button>
              <button className="btn" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}