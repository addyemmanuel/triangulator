"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";

export default function AdminIntegrations() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.adminIntegrations().then(setRows); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["ADMINISTRATION", "API GATEWAY"]} title="API Gateway"
        description="No live carrier connection. Demo environment only." />
      <div className="badge warm" style={{ marginBottom: 14 }}>DEMO ENVIRONMENT — SYNTHETIC PROVIDER ADAPTERS</div>
      <section className="panel">
        <table className="table">
          <thead><tr><th>Provider</th><th>Status</th><th>Last sync</th><th>Requests</th><th>Errors</th><th>Authentication</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.id}>
              <td>{r.provider}</td>
              <td><Badge tone={r.status === "operational" ? "ok" : r.status === "degraded" ? "warn" : "crit"}>{r.status}</Badge></td>
              <td className="mono tnum">{fullTime(r.lastSync)}</td>
              <td className="mono tnum">{r.requests.toLocaleString()}</td>
              <td className="mono tnum">{r.errors}</td>
              <td className="muted">{r.auth}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  );
}