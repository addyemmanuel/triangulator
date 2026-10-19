"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Loading";
import { Check, AlertTriangle, X } from "lucide-react";
import { useAudit } from "@/lib/useAudit";
export default function DeviceProfilerPage() {
  const params = useSearchParams();
  const [imei, setImei] = useState(params.get("imei") ?? "352099781234567");
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const audit = useAudit();

async function analyze(v = imei) {
  setLoading(true); setErr(null); setDevice(null);
  try {
    const d = await api.device(v);
    setDevice(d);
    audit({ action: "device.profile_query", query: `devices/${v}`, dataSource: "Device Service" });
  } catch (e: any) {
    setErr(e.message);
    audit({ action: "device.profile_query", query: `devices/${v}`, dataSource: "Device Service", result: "error" });
  } finally { setLoading(false); }
}

  useEffect(() => { analyze(imei); /* eslint-disable-next-line */ }, []);

  return (
    <div className="page">
      <PageHeader crumbs={["INTELLIGENCE", "DEVICE PROFILER"]} title="Device Profiler"
        description="Look up a device by IMEI or IMEI2. Validation and associated records are synthetic." />

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-b" style={{ display: "flex", gap: 10 }}>
          <input className="input mono" value={imei} onChange={e => setImei(e.target.value)} placeholder="Enter IMEI or IMEI2" style={{ maxWidth: 320 }} />
          <button className="btn primary" onClick={() => analyze()} disabled={loading}>{loading ? "Analyzing…" : "Analyze"}</button>
        </div>
      </div>

      {err && <section className="panel" style={{ borderColor: "rgba(169,86,86,0.5)" }}>
        <div className="panel-h"><h3 style={{ color: "var(--critical)" }}>DATA SOURCE UNAVAILABLE</h3></div>
        <div className="panel-b">
          <p className="muted" style={{ margin: 0 }}>The synthetic provider adapter did not return a response.</p>
          <div className="mono dim" style={{ marginTop: 8, fontSize: 11 }}>Source: Demo MTN Adapter · Reference: DEMO-ERR-204</div>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => analyze()}>Retry</button>
        </div>
      </section>}

      {loading && <section className="panel"><SkeletonTable rows={5} cols={4} /></section>}

      {device && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 18, alignItems: "start" }}>
          <section className="panel">
            <div className="panel-h"><h3>Device Identity</h3><Badge tone={device.status === "in_service" ? "ok" : device.status === "restricted" ? "warn" : "crit"}>{device.status}</Badge></div>
            <div className="panel-b">
              <div className="kv">
                <div className="k">IMEI</div><div className="v mono">{device.imei}</div>
                <div className="k">IMEI2</div><div className="v mono">{device.imei2}</div>
                <div className="k">TAC</div><div className="v mono">{device.tac}</div>
                <div className="k">Manufacturer</div><div className="v">{device.manufacturer}</div>
                <div className="k">Model</div><div className="v">{device.model}</div>
              </div>

              <div className="label" style={{ marginTop: 22, marginBottom: 8 }}>VALIDATION</div>
              <div style={{ display: "grid", gap: 6 }}>
                {device.validation.map((v: any) => (
                  <div key={v.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 4, background: "#FBFCFD" }}>
                    <span style={{ fontSize: 12 }}>{v.label}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5 }}
                      className={v.state === "ok" ? "muted" : v.state === "warn" ? "" : ""}>
                      {v.state === "ok" ? <Check size={12} color="var(--success)" /> : v.state === "warn" ? <AlertTriangle size={12} color="var(--warning)" /> : <X size={12} color="var(--critical)" />}
                      <span style={{ color: v.state === "ok" ? "var(--success)" : v.state === "warn" ? "var(--warning)" : "var(--critical)", fontWeight: 500 }}>
                        {v.state === "ok" ? "Valid" : v.state === "warn" ? "Review" : "Fail"}
                      </span>
                      {v.note && <span className="dim" style={{ fontSize: 10.5 }}>· {v.note}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h"><h3>Associated Records</h3></div>
            <div className="panel-b">
              <div className="label" style={{ marginBottom: 8 }}>SIMs</div>
              {device.associatedSims.length === 0 ? <p className="dim" style={{ margin: 0, fontSize: 12 }}>No SIMs observed.</p> :
                <table className="table">
                  <thead><tr><th>ICCID</th><th>MSISDN</th><th>First seen</th></tr></thead>
                  <tbody>
                    {device.associatedSims.map((s: any) => (
                      <tr key={s.iccid}>
                        <td className="mono" style={{ fontSize: 11 }}>{s.iccid}</td>
                        <td className="mono">{s.msisdn}</td>
                        <td className="mono">{s.firstSeen.slice(0,10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>}

              <div className="label" style={{ marginTop: 20, marginBottom: 8 }}>PREVIOUS DEVICE ASSOCIATIONS</div>
              {device.previousDevices.length === 0 ? <p className="dim" style={{ margin: 0, fontSize: 12 }}>None recorded.</p> :
                <table className="table">
                  <thead><tr><th>IMEI</th><th>Model</th><th>Last seen</th></tr></thead>
                  <tbody>
                    {device.previousDevices.map((p: any) => (
                      <tr key={p.imei}><td className="mono">{p.imei}</td><td>{p.model}</td><td className="mono">{p.lastSeen.slice(0,10)}</td></tr>
                    ))}
                  </tbody>
                </table>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}