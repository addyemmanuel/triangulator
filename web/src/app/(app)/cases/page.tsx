"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Loading";
import { Empty } from "@/components/ui/Empty";
import { fullTime } from "@/lib/format";

export default function CasesList() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [inv, setInv] = useState("all");
  const [page, setPage] = useState(1);
  const per = 5;

  useEffect(() => { api.cases().then(setRows); }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter(r =>
      (status === "all" || r.status === status) &&
      (inv === "all" || r.investigator === inv) &&
      (q === "" || r.id.toLowerCase().includes(q.toLowerCase()) || r.targetIds.join(",").toLowerCase().includes(q.toLowerCase()))
    );
  }, [rows, q, status, inv]);

  const paged = filtered.slice((page - 1) * per, page * per);
  const pages = Math.max(1, Math.ceil(filtered.length / per));

  return (
    <div className="page">
      <PageHeader
        crumbs={["CASE MANAGEMENT", "ACTIVE CASES"]}
        title="Active Cases"
        description="Open cases under current authorisation. Actions are recorded against your badge."
        action={<Link className="btn primary" href="/cases/new">New Investigation</Link>}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input className="input" placeholder="Search case ID or target" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} style={{ maxWidth: 280 }} />
        <select className="select" value={status} onChange={e => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_review">Pending review</option>
          <option value="archived">Archived</option>
        </select>
        <select className="select" value={inv} onChange={e => setInv(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="all">All investigators</option>
          <option value="A. ADEYEMI">A. ADEYEMI</option>
          <option value="N. CHUKWU">N. CHUKWU</option>
        </select>
      </div>

      <section className="panel">
        {!rows ? <SkeletonTable /> : paged.length === 0 ? (
          <Empty title="NO MATCHING CASES" message="Adjust the filters, or start a new investigation to see cases here."
            action={<Link className="btn" href="/cases/new">New Investigation</Link>} />
        ) : (
          <table className="table">
            <thead><tr><th>Case ID</th><th>Target</th><th>Status</th><th>Authorization</th><th>Last event</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id}>
                  <td className="id">{c.id}</td>
                  <td className="mono">{c.targetIds[0]}</td>
                  <td>{c.status === "active" ? <Badge tone="acc"><StatusDot tone="acc" /> Active</Badge>
                      : c.status === "pending_review" ? <Badge tone="warn">Pending review</Badge>
                      : <Badge>Archived</Badge>}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{c.authorization}</td>
                  <td className="tnum">{fullTime(c.lastEventAt)}</td>
                  <td className="tnum">{fullTime(c.updatedAt)}</td>
                  <td><Link className="btn ghost sm" href={`/cases/${c.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: "1px solid var(--border)", fontSize: 12 }}>
          <span className="dim">{filtered.length} case{filtered.length === 1 ? "" : "s"} · page {page} of {pages}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <button className="btn sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}