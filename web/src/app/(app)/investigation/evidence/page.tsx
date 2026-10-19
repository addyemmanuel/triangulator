"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";
import { FileLock2, Sparkles } from "lucide-react";
import { useAudit } from "@/lib/useAudit";
export default function EvidencePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const audit = useAudit();
  useEffect(() => { api.targetEvidence("TARGET-001").then(setRows); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["INVESTIGATION", "EVIDENCE"]} title="Evidence & Chain of Custody"
        description="Case CASE-2026-9941A · Authorization AUTH-DEMO-2026-0041. Synthetic evidence only."
        action={<button className="btn primary" onClick={() => {
  setReportOpen(true);
  audit({ action: "evidence.report_generated", caseId: "CASE-2026-9941A", query: "evidence/report", dataSource: "Evidence Service" });
}}><Sparkles size={13} /> Generate Investigation Report</button>} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "start" }}>
        <section className="panel">
          <div className="panel-h"><h3>Evidence</h3></div>
          <table className="table">
            <thead><tr><th>Evidence ID</th><th>Type</th><th>Description</th><th>Added by</th><th>Timestamp</th><th>Verification</th><th>Integrity</th></tr></thead>
            <tbody>
              {rows.map(e => (
                <tr key={e.id}>
                  <td className="id">{e.id}</td>
                  <td>{e.type}</td>
                  <td className="muted">{e.description}</td>
                  <td className="mono">{e.addedBy}</td>
                  <td className="mono tnum">{fullTime(e.timestamp)}</td>
                  <td><Badge tone={e.verification === "verified" ? "ok" : e.verification === "reviewed" ? "acc" : "neutral"}>{e.verification}</Badge></td>
                  <td className="mono dim" style={{ fontSize: 11 }}>{e.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="panel">
          <div className="panel-h"><h3>Chain of Custody</h3></div>
          <div className="panel-b">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
              {["CREATED","COLLECTED","REVIEWED","VERIFIED","REPORT GENERATED"].map((s, i) => {
                const done = i < 4;
                return (
                  <li key={s} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10, alignItems: "center", fontSize: 12 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: done ? "var(--accent)" : "#FFFFFF",
                      border: `1.5px solid ${done ? "var(--accent)" : "var(--border-strong)"}`
                    }} />
                    <span style={{ fontWeight: 600, letterSpacing: "0.02em", color: done ? "var(--text)" : "var(--text-3)" }}>{s}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>

      {reportOpen && (
        <div className="drawer-scrim" onClick={() => setReportOpen(false)}>
          <aside className="drawer" onClick={e => e.stopPropagation()}>
            <div className="h"><h3 className="label" style={{ margin: 0 }}>SIMULATED REPORT PREVIEW</h3><button className="icon-btn" onClick={() => setReportOpen(false)}>×</button></div>
            <div className="b">
              <div className="label" style={{ marginBottom: 6 }}>IMEI TRIANGULATOR — SYNTHETIC DEMO REPORT</div>
              <h2 style={{ margin: "6px 0 10px" }}>Investigation Summary · CASE-2026-9941A</h2>
              <p className="muted" style={{ fontSize: 12 }}>Generated {fullTime(new Date().toISOString())} against authorization AUTH-DEMO-2026-0041.</p>
              <div className="kv" style={{ marginTop: 14 }}>
                <div className="k">Targets</div><div className="v mono">TARGET-001, TARGET-002</div>
                <div className="k">Evidence items</div><div className="v mono">EVD-0001, EVD-0002, EVD-0003</div>
                <div className="k">Anomaly indicators</div><div className="v">3</div>
                <div className="k">Primary IMEI</div><div className="v mono">352099781234567</div>
                <div className="k">Primary MSISDN</div><div className="v mono">+234 800 000 1421</div>
              </div>
              <p className="dim" style={{ fontSize: 11, marginTop: 20 }}>
                This report is generated from synthetic demo data. It is not a lawful evidentiary product.
                In production, this preview would be replaced by the authorized evidence report generator.
              </p>
              <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
                <button className="btn primary"><FileLock2 size={13} /> Finalize (demo)</button>
                <button className="btn" onClick={() => setReportOpen(false)}>Cancel</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}