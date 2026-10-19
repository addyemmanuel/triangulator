"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { EventTimeline } from "@/components/timeline/EventTimeline";
import { Badge } from "@/components/ui/Badge";
import { fullTime } from "@/lib/format";
import { useInvestigation } from "@/lib/investigation";
import { useAudit } from "@/lib/useAudit";

export default function TimelinePage() {
  const { targetId, selectedEventId, selectEvent } = useInvestigation();
  const audit = useAudit();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.targetTimeline(targetId).then(evs => {
      setEvents(evs);
      if (!selectedEventId && evs.length) selectEvent(evs[evs.length - 1].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const selected = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  function handleSelect(id: string) {
    selectEvent(id);
    audit({ action: "timeline.event_selected", query: `timeline/${id}`, dataSource: "Timeline" });
  }

  return (
    <div className="page">
      <PageHeader
        crumbs={["INVESTIGATION", "TIMELINE"]}
        title="Timeline Analysis"
        description="Selecting a node here updates the shared investigation selection. The workspace and events pages will reflect the same choice."
        action={<Link className="btn" href={`/cases/CASE-2026-9941A`}>Back to workspace</Link>}
      />

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h">
          <h3>Event Timeline</h3>
          <span className="dim" style={{ fontSize: 11 }}>← / → to step · Home / End to jump</span>
        </div>
        <EventTimeline events={events} selectedId={selectedEventId} onSelect={handleSelect} />
      </section>

      <section className="panel">
        <div className="panel-h">
          <h3>Synchronized Event Table</h3>
          {selected && <span className="mono dim" style={{ fontSize: 11 }}>selected: {selected.id} · {selected.cellId} · {selected.sector}</span>}
        </div>
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          <table className="table">
            <thead style={{ position: "sticky", top: 0 }}>
              <tr><th>Time</th><th>Event</th><th>Cell</th><th>Sector</th><th>Type</th><th>Provider</th><th>Confidence</th></tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className={e.id === selectedEventId ? "selected" : ""} onClick={() => handleSelect(e.id)} style={{ cursor: "pointer" }}>
                  <td className="mono tnum">{fullTime(e.timestamp)}</td>
                  <td className="mono">{e.id}</td>
                  <td className="mono">{e.cellId}</td>
                  <td className="mono">{e.sector}</td>
                  <td>{e.type}</td>
                  <td className="muted">{e.provider}</td>
                  <td><Badge tone={e.confidence === "high" ? "ok" : e.confidence === "medium" ? "warn" : "neutral"}>{e.confidence}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div aria-live="polite" className="sr-live">
        {selected ? `Selected event ${selected.id} at ${fullTime(selected.timestamp)}` : ""}
      </div>
    </div>
  );
}