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
import { useInvestigation } from "@/lib/investigation";
import { useAudit } from "@/lib/useAudit";

const PER_PAGE = 20;

export default function NetworkEventsPage() {
  const { targetId, selectedEventId, selectEvent } = useInvestigation();
  const audit = useAudit();
  const [events, setEvents] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setEvents(null);
    api.targetEvents(targetId).then(evs => setEvents(evs));
  }, [targetId]);

  const filtered = useMemo(() => (events ?? []).filter(e =>
    q === "" || [e.id, e.imei, e.msisdn, e.cellId, e.type].some(s => String(s).toLowerCase().includes(q.toLowerCase()))
  ), [events, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const selected = useMemo(() => (events ?? []).find(e => e.id === selectedEventId), [events, selectedEventId]);

  function open(e: any) {
    selectEvent(e.id);
    setDrawerOpen(true);
    audit({ action: "network.event_opened", query: `events/${e.id}`, dataSource: e.source });
  }

  return (
    <div className="page">
      <PageHeader
        crumbs={["INVESTIGATION", "NETWORK EVENTS"]}
        title="Network Events"
        description="Dense synthetic event table. Selection is shared with the workspace and timeline."
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input
          className="input"
          placeholder="Filter by event ID, IMEI, MSISDN, cell"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          style={{ maxWidth: 320 }}
        />
        <span className="dim" style={{ fontSize: 12 }}>{filtered.length} events</span>
      </div>

      <section className="panel">
        {!events ? <SkeletonTable rows={10} cols={8} /> : filtered.length === 0 ? (
          <Empty
            title="NO NETWORK EVENTS"
            message="No synthetic network events are currently available for this target."
            action={<button className="btn" onClick={() => setQ("")}>Clear filters</button>}
          />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr><th>Timestamp</th><th>Type</th><th>IMEI</th><th>MSISDN</th><th>Cell ID</th><th>Sector</th><th>Provider</th><th>Conf.</th><th>Source</th></tr>
              </thead>
              <tbody>
                {paged.map(e => (
                  <tr
                    key={e.id}
                    onClick={() => open(e)}
                    className={e.id === selectedEventId ? "selected" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="mono tnum">{fullTime(e.timestamp)}</td>
                    <td>{e.type}</td>
                    <td className="mono">{e.imei}</td>
                    <td className="mono">{e.msisdn}</td>
                    <td className="mono">{e.cellId}</td>
                    <td className="mono">{e.sector}</td>
                    <td>{e.provider}</td>
                    <td><Badge tone={e.confidence === "high" ? "ok" : e.confidence === "medium" ? "warn" : "neutral"}>{e.confidence}</Badge></td>
                    <td className="muted">{e.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={filtered.length} onPage={setPage} unit="events" />
          </>
        )}
      </section>

      <Drawer open={drawerOpen && !!selected} title="EVENT DETAILS" onClose={() => setDrawerOpen(false)}>
        {selected && (
          <div className="kv">
            <div className="k">Event ID</div><div className="v mono">{selected.id}</div>
            <div className="k">Timestamp</div><div className="v mono">{fullTime(selected.timestamp)}</div>
            <div className="k">Type</div><div className="v">{selected.type}</div>
            <div className="k">Network source</div><div className="v">{selected.source}</div>
            <div className="k">Device</div><div className="v mono">{selected.imei}</div>
            <div className="k">MSISDN</div><div className="v mono">{selected.msisdn}</div>
            <div className="k">Cell</div><div className="v mono">{selected.cellId}</div>
            <div className="k">Sector</div><div className="v mono">{selected.sector}</div>
            <div className="k">Confidence</div><div className="v"><Badge tone={selected.confidence === "high" ? "ok" : selected.confidence === "medium" ? "warn" : "neutral"}>{selected.confidence}</Badge></div>
            <div className="k">Authorization</div><div className="v mono">AUTH-DEMO-2026-0041</div>
            <div className="k">Case ref</div><div className="v mono">{selected.caseId}</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}