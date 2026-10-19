"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { SkeletonBlock } from "@/components/ui/Loading";

const CellMap = dynamic(
  () => import("@/components/map/CellMap").then(m => m.CellMap),
  { ssr: false, loading: () => <div className="sk" style={{ height: 480 }} /> }
);

export default function CellsPage() {
  const [cells, setCells] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [provider, setProvider] = useState("all");

  useEffect(() => {
    api.cells().then(c => {
      setCells(c);
      setSelectedId(c[0]?.id ?? null);
    });
  }, []);

  const filtered = useMemo(
    () => (provider === "all" ? cells : cells.filter(c => c.provider === provider)),
    [cells, provider]
  );

  // Keep the selection valid when the provider filter narrows the set.
  useEffect(() => {
    if (filtered.length && !filtered.some(c => c.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find(c => c.id === selectedId) ?? cells.find(c => c.id === selectedId);

  return (
    <div className="page">
      <PageHeader
        crumbs={["INTELLIGENCE", "CELL-SITE MAPPING"]}
        title="Cell-Site Mapping"
        description="Synthetic cell-site reference across demo providers. Cell-based location only."
      />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gap: 14, alignItems: "start" }}>
        <aside className="panel">
          <div className="panel-h"><h3>Filters</h3></div>
          <div className="panel-b" style={{ display: "grid", gap: 10 }}>
            <div className="field">
              <label>Provider</label>
              <select className="select" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="all">All providers</option>
                {Array.from(new Set(cells.map(c => c.provider))).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Cell ID</label>
              <select className="select" value={selectedId ?? ""} onChange={e => setSelectedId(e.target.value)}>
                {filtered.map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Date / time window</label>
              <input className="input" defaultValue="Last 24h" />
            </div>
          </div>
        </aside>

        <div className="panel" style={{ overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <SkeletonBlock h={560} />
          ) : (
            <div style={{ height: 560 }}>
              <CellMap
                cells={filtered}
                events={[]}
                selectedEventId={null}
                onSelectEvent={() => {}}
                onSelectCell={(id) => setSelectedId(id)}
              />
            </div>
          )}
        </div>

        <aside className="panel">
          <div className="panel-h"><h3>Selected Cell</h3></div>
          <div className="panel-b">
            {!selected ? (
              <p className="dim" style={{ fontSize: 12, margin: 0 }}>Select a cell.</p>
            ) : (
              <div className="kv" style={{ gridTemplateColumns: "110px 1fr" }}>
                <div className="k">Cell ID</div><div className="v mono">{selected.id}</div>
                <div className="k">Name</div><div className="v">{selected.name}</div>
                <div className="k">Provider</div><div className="v">{selected.provider}</div>
                <div className="k">Sectors</div><div className="v mono">{selected.sectors.length}</div>
                <div className="k">Event count</div><div className="v mono">{selected.historicalAssociations}</div>
                <div className="k">Coverage</div><div className="v">{selected.coverage}</div>
                <div className="k">Confidence</div>
                <div className="v">
                  <Badge tone={selected.confidence === "high" ? "ok" : selected.confidence === "medium" ? "warn" : "neutral"}>
                    {selected.confidence}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}