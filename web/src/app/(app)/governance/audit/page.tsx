"use client";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Loading";
import { Drawer } from "@/components/ui/Drawer";
import { Pagination } from "@/components/ui/Pagination";
import { Empty } from "@/components/ui/Empty";
import { fullTime } from "@/lib/format";

const PER_PAGE = 25;

export default function AuditPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [sel, setSel] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  async function load() { setRows(await api.audit()); }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => (rows ?? []).filter(r =>
    q === "" || [r.id, r.user, r.action, r.caseId, r.dataSource].some(s => String(s).toLowerCase().includes(q.toLowerCase()))
  ), [rows, q]);

  const totals = useMemo(() => ({
    t: filtered.length,
    ok: filtered.filter(r => r.result === "success").length,
    fail: filtered.filter(r => r.result !== "success").length,
    users: new Set(filtered.map(r => r.user)).size
  }), [filtered]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page">
      <PageHeader
        crumbs={["GOVERNANCE", "AUDIT TRAIL"]}
        title="Audit Trail"
        description="Immutable synthetic audit log. New actions taken during this session appear at the top."
        action={<button className="btn" onClick={load}>Refresh</button>}
      />

      <div className="strip" style={{ marginBottom: 18 }}>
        <div className="cell"><div className="k">Total audit events</div><div className="v">{totals.t}</div></div>
        <div className="cell"><div className="k">Successful actions</div><div className="v">{totals.ok}</div></div>
        <div className="cell"><div className="k">Failed actions</div><div className="v">{totals.fail}</div></div>
        <div className="cell"><div className="k">Active users</div><div className="v">{totals.users}</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          className="input"
          placeholder="Filter by user, action, case"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          style={{ maxWidth: 320 }}
        />
      </div>

      <section className="panel">
        {!rows ? <SkeletonTable rows={10} cols={8} /> : filtered.length === 0 ? (
          <Empty title="NO AUDIT EVENTS" message="No audit events match the current filter." action={<button className="btn" onClick={() => setQ("")}>Clear filter</button>} />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Case</th><th>Action</th><th>Query</th><th>Data source</th><th>Authorization</th><th>Result</th></tr>
              </thead>
              <tbody>
                {paged.map(r => (
                  <tr key={r.id} onClick={() => setSel(r)} style={{ cursor: "pointer" }}>
                    <td className="mono tnum">{fullTime(r.timestamp)}</td>
                    <td className="mono">{r.user}</td>
                    <td className="mono">{r.caseId}</td>
                    <td>{r.action}</td>
                    <td className="mono dim" style={{ fontSize: 11 }}>{r.query}</td>
                    <td className="muted">{r.dataSource}</td>
                    <td className="mono dim" style={{ fontSize: 11 }}>{r.authorization}</td>
                    <td><Badge tone={r.result === "success" ? "ok" : r.result === "denied" ? "warn" : "crit"}>{r.result}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={filtered.length} onPage={setPage} unit="events" />
          </>
        )}
      </section>

      <Drawer open={!!sel} title="AUDIT EVENT" onClose={() => setSel(null)}>
        {sel && (
          <div className="kv">
            <div className="k">Audit ID</div><div className="v mono">{sel.id}</div>
            <div className="k">Timestamp</div><div className="v mono">{fullTime(sel.timestamp)}</div>
            <div className="k">User</div><div className="v mono">{sel.user}</div>
            <div className="k">Case</div><div className="v mono">{sel.caseId}</div>
            <div className="k">Action</div><div className="v">{sel.action}</div>
            <div className="k">Query</div><div className="v mono">{sel.query}</div>
            <div className="k">Data source</div><div className="v">{sel.dataSource}</div>
            <div className="k">Authorization</div><div className="v mono">{sel.authorization}</div>
            <div className="k">Result</div><div className="v"><Badge tone={sel.result === "success" ? "ok" : sel.result === "denied" ? "warn" : "crit"}>{sel.result}</Badge></div>
            <div className="k">Demo note</div>
            <div className="v" style={{ fontSize: 11 }}>Synthetic audit record. No real user activity is represented.</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}