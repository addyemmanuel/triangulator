"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";

export default function ArchivePage() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api.cases().then(c => setRows(c.filter((x: any) => x.status === "archived"))); }, []);
  return (
    <div className="page">
      <PageHeader crumbs={["CASE MANAGEMENT", "CLOSED ARCHIVES"]} title="Closed Archives"
        description="Read-only historical cases. Evidence is sealed; no new events can be added." />
      <div className="badge warm" style={{ marginBottom: 14, padding: "6px 10px" }}>READ ONLY ARCHIVE</div>
      <section className="panel">
        <table className="table">
          <thead><tr><th>Case ID</th><th>Target</th><th>Closed</th><th>Lead</th><th>Evidence</th><th>Archive</th><th></th></tr></thead>
          <tbody>
            {!rows ? <tr><td colSpan={7} className="dim">Loading…</td></tr> : rows.length === 0 ? (
              <tr><td colSpan={7} className="dim">No archived cases.</td></tr>
            ) : rows.map(c => (
              <tr key={c.id}>
                <td className="id">{c.id}</td>
                <td className="mono">{c.targetIds.join(", ")}</td>
                <td className="tnum">{c.closedAt ? fullTime(c.closedAt) : "—"}</td>
                <td>{c.investigator}</td>
                <td><Badge tone="ok">{c.evidenceStatus ?? "—"}</Badge></td>
                <td><Badge tone="warm">{c.archiveStatus ?? "—"}</Badge></td>
                <td><Link className="btn ghost sm" href={`/cases/${c.id}`}>Open (read-only)</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}