"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";

export default function AdminCompliance() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.adminCompliance().then(setD); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["ADMINISTRATION", "COMPLIANCE VAULT"]} title="Compliance Vault"
        description="Authorization records, access history, evidence actions, policy events." />

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h"><h3>Authorization Records</h3></div>
        <table className="table">
          <thead><tr><th>Case</th><th>Authorization</th><th>Valid from</th><th>Valid until</th><th>Investigator</th></tr></thead>
          <tbody>{d?.cases.map((c: any) => (
            <tr key={c.id}>
              <td className="mono">{c.id}</td>
              <td className="mono">{c.authorization}</td>
              <td className="mono tnum">{fullTime(c.validFrom)}</td>
              <td className="mono tnum">{fullTime(c.validUntil)}</td>
              <td>{c.investigator}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      <section className="panel">
        <div className="panel-h"><h3>Recent Policy Events</h3></div>
        <table className="table">
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Result</th></tr></thead>
          <tbody>{d?.audit.slice(0, 10).map((a: any) => (
            <tr key={a.id}>
              <td className="mono tnum">{fullTime(a.timestamp)}</td>
              <td className="mono">{a.user}</td>
              <td>{a.action}</td>
              <td><Badge tone={a.result === "success" ? "ok" : a.result === "denied" ? "warn" : "crit"}>{a.result}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  );
}