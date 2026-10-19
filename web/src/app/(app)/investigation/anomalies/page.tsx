"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";

export default function AnomaliesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.targetAnomalies("TARGET-001").then(setRows); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["INVESTIGATION", "RISK & ANOMALIES"]} title="Risk & Anomalies"
        description="Analytical review board. Indicators describe potential anomalies, not conclusions." />

      <section className="panel" style={{ marginBottom: 14, background: "#FBF7EE", borderColor: "rgba(181,139,82,0.4)" }}>
        <div className="panel-b" style={{ fontSize: 12, color: "#6E5B3A" }}>
          These indicators identify potential anomalies and do not automatically establish criminal activity.
        </div>
      </section>

      <section className="panel">
        <div className="panel-h"><h3>Active Indicators</h3></div>
        <table className="table">
          <thead><tr><th>Indicator</th><th>Severity</th><th>Description</th><th>Evidence</th><th>First detected</th><th>Last detected</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.indicator}</td>
                <td><Badge tone={r.severity === "high" ? "crit" : r.severity === "medium" ? "warn" : "neutral"}>{r.severity}</Badge></td>
                <td className="muted">{r.description}</td>
                <td className="mono dim" style={{ fontSize: 11 }}>{r.evidence}</td>
                <td className="mono tnum">{fullTime(r.firstDetected)}</td>
                <td className="mono tnum">{fullTime(r.lastDetected)}</td>
                <td><Badge tone={r.status === "open" ? "warn" : r.status === "reviewing" ? "acc" : "neutral"}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}