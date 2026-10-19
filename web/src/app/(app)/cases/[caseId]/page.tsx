"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { SkeletonBlock } from "@/components/ui/Loading";
import { Drawer } from "@/components/ui/Drawer";
import { fullTime, shortTime } from "@/lib/format";
import { useInvestigation } from "@/lib/investigation";
import { useAudit } from "@/lib/useAudit";

const CellMap = dynamic(
  () => import("@/components/map/CellMap").then(m => m.CellMap),
  { ssr: false, loading: () => <div className="sk" style={{ height: 460 }} /> }
);

const targetNav = [
  { href: "#overview", label: "Overview" },
  { href: "#device", label: "Device" },
  { href: "#identity", label: "Identity" },
  { href: "#events", label: "Network Events" },
  { href: "#timeline", label: "Timeline" },
  { href: "#anomalies", label: "Anomalies" },
  { href: "#evidence", label: "Evidence" }
];

export default function CaseWorkspace() {
  const { caseId } = useParams<{ caseId: string }>();
  const { selectedEventId, selectEvent, setTarget, setCase } = useInvestigation();
  const audit = useAudit();

  const [c, setC] = useState<any>(null);
  const [t, setT] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("#overview");

  useEffect(() => {
    (async () => {
      const kase = await api.case(caseId);
      setC(kase);
      setCase(kase.id);
      audit({
        action: "case.opened",
        caseId: kase.id,
        query: `cases/${kase.id}`,
        dataSource: "Case Service"
      });
      const tgs = await api.caseTargets(caseId);
      const primary = tgs[0];
      setT(primary);
      if (primary) {
        setTarget(primary.id);
        const [evs, an] = await Promise.all([
          api.targetEvents(primary.id),
          api.targetAnomalies(primary.id)
        ]);
        setEvents(evs);
        setAnomalies(an);
        if (!selectedEventId && evs.length) selectEvent(evs[evs.length - 1].id);
      }
      setCells(await api.cells());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const selectedEvent = useMemo(
    () => events.find(e => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );
  const isArchived = c?.status === "archived";

  function handleSelectEvent(id: string) {
    selectEvent(id);
    setDrawerOpen(true);
    const ev = events.find(x => x.id === id);
    if (ev) {
      audit({
        action: "network.event_selected",
        caseId,
        query: `events/${id}`,
        dataSource: ev.source
      });
    }
  }

  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      <PageHeader
        crumbs={["CASE MANAGEMENT", "TARGET WORKSPACE", caseId]}
        title={c ? `CASE #${c.id}` : "Loading…"}
        description={c?.purpose}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            {isArchived && <span className="badge warm">READ ONLY ARCHIVE</span>}
            <Link className="btn" href="/investigation/evidence">Evidence</Link>
          </div>
        }
      />

      <div className="strip" style={{ marginBottom: 14 }}>
        <div className="cell"><div className="k">Target</div><div className="v mono">{t?.id ?? "—"}</div></div>
        <div className="cell">
          <div className="k">Status</div>
          <div className="v">
            {c?.status === "active" ? <><StatusDot tone="acc" /> Active</> : c?.status ?? "—"}
          </div>
        </div>
        <div className="cell">
          <div className="k">Authorization</div>
          <div className="v mono" style={{ fontSize: 12 }}>{c?.authorization ?? "—"}</div>
        </div>
        <div className="cell">
          <div className="k">Valid until</div>
          <div className="v mono" style={{ fontSize: 12 }}>
            {c?.validUntil ? fullTime(c.validUntil) : "—"}
          </div>
        </div>
        <div className="cell">
          <div className="k">Last Event</div>
          <div className="v mono" style={{ fontSize: 12 }}>
            {selectedEvent ? fullTime(selectedEvent.timestamp) : c?.lastEventAt ? fullTime(c.lastEventAt) : "—"}
          </div>
        </div>
      </div>

      <div className="workspace">
        <nav className="zone-nav" aria-label="Target sections">
          {targetNav.map(n => (
            <a
              key={n.href}
              href={n.href}
              className={activeNav === n.href ? "active" : ""}
              onClick={() => setActiveNav(n.href)}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="zone-main">
          {!cells.length || !events.length ? (
            <div style={{ padding: 20 }}><SkeletonBlock h={460} /></div>
          ) : (
            <CellMap
              cells={cells}
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              onSelectCell={() => selectEvent(null)}
            />
          )}

          <div style={{ borderTop: "1px solid var(--border)" }}>
            <div className="ws-strip">
              <span className="label">NETWORK / EVENT TIMELINE</span>
              <span className="dim" style={{ fontSize: 11 }}>
                {events.length} synthetic events · {cells.length} cells
              </span>
              <Link
                className="btn ghost sm"
                href="/investigation/timeline"
                style={{ marginLeft: "auto" }}
              >
                Open full timeline
              </Link>
            </div>
            <div style={{ overflowX: "auto", padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 4, minWidth: 720 }}>
                {events.slice(-24).map(ev => {
                  const sel = ev.id === selectedEventId;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => handleSelectEvent(ev.id)}
                      className="btn sm"
                      aria-pressed={sel}
                      style={{
                        flex: "0 0 auto",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 2,
                        padding: "6px 8px",
                        minWidth: 92,
                        borderColor: sel ? "var(--accent)" : "var(--border-strong)",
                        background: sel ? "var(--accent-soft)" : "var(--surface)",
                        color: sel ? "var(--accent)" : "var(--text)"
                      }}
                    >
                      <span className="mono" style={{ fontSize: 10, opacity: 0.8 }}>
                        {shortTime(ev.timestamp)}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 600 }}>{ev.cellId}</span>
                      <span style={{ fontSize: 9.5, color: "var(--text-3)" }}>{ev.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="zone-side">
          <div className="label" style={{ marginBottom: 8 }}>TARGET PROFILE</div>
          {t ? (
            <>
              <div className="kv" style={{ gridTemplateColumns: "82px 1fr", fontSize: 12 }}>
                <div className="k">Target</div><div className="v mono">{t.id}</div>
                <div className="k">IMEI</div><div className="v mono">{t.imei}</div>
                <div className="k">IMEI2</div><div className="v mono">{t.imei2}</div>
                <div className="k">MSISDN</div><div className="v mono">{t.msisdn}</div>
                <div className="k">ICCID</div><div className="v mono" style={{ fontSize: 11 }}>{t.iccid}</div>
                <div className="k">Subscriber</div><div className="v">{t.subscriber}</div>
                <div className="k">Device</div><div className="v mono">{t.deviceId}</div>
                <div className="k">Last event</div>
                <div className="v mono">
                  {selectedEvent ? fullTime(selectedEvent.timestamp) : fullTime(t.lastEventAt)}
                </div>
                <div className="k">Status</div><div className="v"><Badge tone="acc">{t.status}</Badge></div>
              </div>

              <div className="label" style={{ marginTop: 22, marginBottom: 8 }}>INDICATORS</div>
              <div style={{ display: "grid", gap: 8 }}>
                {(anomalies.length ? anomalies : [
                  { id: "x", indicator: "Multiple SIM Associations Detected", severity: "medium" },
                  { id: "y", indicator: "IMEI Anomaly Detected", severity: "high" }
                ]).map((a: any) => (
                  <div
                    key={a.id}
                    style={{
                      border: "1px solid var(--border)",
                      background: "#FFFFFF",
                      padding: 10,
                      borderRadius: 4
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{a.indicator}</span>
                      <Badge tone={a.severity === "high" ? "crit" : a.severity === "medium" ? "warn" : "neutral"}>
                        {a.severity}
                      </Badge>
                    </div>
                    {a.description && (
                      <p className="muted" style={{ fontSize: 11, margin: "6px 0 0" }}>{a.description}</p>
                    )}
                    {a.evidence && (
                      <div className="mono dim" style={{ fontSize: 10, marginTop: 6 }}>{a.evidence}</div>
                    )}
                  </div>
                ))}
              </div>

              <p className="dim" style={{ fontSize: 10.5, marginTop: 16, lineHeight: 1.55 }}>
                These indicators identify potential anomalies and do not automatically establish criminal activity.
              </p>
            </>
          ) : <SkeletonBlock h={320} />}
        </aside>
      </div>

      <div aria-live="polite" className="sr-live">
        {selectedEvent
          ? `Selected event ${selectedEvent.id} at ${shortTime(selectedEvent.timestamp)} on cell ${selectedEvent.cellId}`
          : ""}
      </div>

      <Drawer
        open={drawerOpen && !!selectedEvent}
        title="EVENT DETAILS"
        onClose={() => setDrawerOpen(false)}
      >
        {selectedEvent && (
          <div className="kv">
            <div className="k">Event ID</div><div className="v mono">{selectedEvent.id}</div>
            <div className="k">Timestamp</div><div className="v mono">{fullTime(selectedEvent.timestamp)}</div>
            <div className="k">Type</div><div className="v">{selectedEvent.type}</div>
            <div className="k">IMEI</div><div className="v mono">{selectedEvent.imei}</div>
            <div className="k">MSISDN</div><div className="v mono">{selectedEvent.msisdn}</div>
            <div className="k">Cell</div><div className="v mono">{selectedEvent.cellId}</div>
            <div className="k">Sector</div><div className="v mono">{selectedEvent.sector}</div>
            <div className="k">Provider</div><div className="v">{selectedEvent.provider}</div>
            <div className="k">Confidence</div>
            <div className="v">
              <Badge tone={selectedEvent.confidence === "high" ? "ok" : selectedEvent.confidence === "medium" ? "warn" : "neutral"}>
                {selectedEvent.confidence}
              </Badge>
            </div>
            <div className="k">Authorization</div><div className="v mono">{c?.authorization}</div>
            <div className="k">Case ref</div><div className="v mono">{c?.id}</div>
          </div>
        )}
      </Drawer>
    </div>
  );
}