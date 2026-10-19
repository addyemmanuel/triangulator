"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { SkeletonBlock } from "@/components/ui/Loading";
import { IdentityGraph } from "@/components/identity/IdentityGraph";
import { Badge } from "@/components/ui/Badge";
import { useAudit } from "@/lib/useAudit";
export default function IdentityLinkerPage() {
  const [targetId, setTargetId] = useState("TARGET-001");
  const [data, setData] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const audit = useAudit();


 useEffect(() => {
  api.identity(targetId).then(d => {
    setData(d);
    audit({ action: "identity.graph_query", query: `identity/${targetId}`, dataSource: "Identity Service" });
  });
}, [targetId]);

  return (
    <div className="page">
      <PageHeader crumbs={["INTELLIGENCE", "IDENTITY LINKER"]} title="Identity Linker"
        description="Relationships between devices, identity elements, and other targets. Node shapes carry meaning." />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-b" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="input mono" value={targetId} onChange={e => setTargetId(e.target.value)} style={{ maxWidth: 220 }} />
          <span className="dim" style={{ fontSize: 11 }}>Example: TARGET-001, TARGET-003</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
        {!data ? <SkeletonBlock h={520} /> : <IdentityGraph target={data.target} device={data.device} relatedTargets={data.relatedTargets} selectedId={selectedId} onSelect={setSelectedId} />}

        <aside className="panel">
          <div className="panel-h"><h3>Selected Relationship</h3></div>
          <div className="panel-b">
            {!selectedId ? <p className="dim" style={{ fontSize: 12, margin: 0 }}>Select a node in the graph to inspect.</p> : (
              <div className="kv">
                <div className="k">Selected</div><div className="v mono">{selectedId.split(":")[1]}</div>
                <div className="k">Kind</div><div className="v">{selectedId.split(":")[0].toUpperCase()}</div>
              </div>
            )}
            <div className="label" style={{ marginTop: 16, marginBottom: 6 }}>LEGEND</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 11.5, color: "var(--text-2)", display: "grid", gap: 4 }}>
              <li>▭ Device / IMEI / IMEI2</li>
              <li>◯ ICCID</li>
              <li>◇ MSISDN</li>
              <li>△ Subscriber</li>
              <li>⬭ Target</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}