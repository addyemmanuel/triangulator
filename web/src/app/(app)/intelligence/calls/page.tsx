"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { fullTime } from "@/lib/format";
import { Plus, PhoneCall, CheckCircle2 } from "lucide-react";

// SYNTHETIC DEMO DATA ONLY.
// No real MSISDNs, call records or carrier responses.
const CDR_RECORDS = [
  { id: "CDR-00001", ts: "2026-06-14T14:32:00Z", a: "+234 800 000 1421", b: "+234 800 000 1877", dir: "Outgoing", dur: "00:02:14", cell: "CELL-001", provider: "Demo MTN Adapter" },
  { id: "CDR-00002", ts: "2026-06-14T13:58:00Z", a: "+234 800 000 1421", b: "+234 800 000 2010", dir: "Incoming", dur: "00:00:41", cell: "CELL-003", provider: "Demo Airtel Adapter" },
  { id: "CDR-00003", ts: "2026-06-14T12:11:00Z", a: "+234 800 000 1877", b: "+234 800 000 1421", dir: "Incoming", dur: "00:05:02", cell: "CELL-002", provider: "Demo MTN Adapter" },
  { id: "CDR-00004", ts: "2026-06-14T10:47:00Z", a: "+234 800 000 1421", b: "+234 800 000 4110", dir: "Missed",  dur: "—",        cell: "CELL-005", provider: "Demo Glo Adapter" },
  { id: "CDR-00005", ts: "2026-06-14T09:26:00Z", a: "+234 800 000 3300", b: "+234 800 000 1421", dir: "Outgoing", dur: "00:01:07", cell: "CELL-004", provider: "Demo Airtel Adapter" },
  { id: "CDR-00006", ts: "2026-06-13T18:02:00Z", a: "+234 800 000 2010", b: "+234 800 000 2042", dir: "Outgoing", dur: "00:03:33", cell: "CELL-007", provider: "Demo 9mobile Adapter" }
];

const PROVIDERS = [
  { id: "mtn",    label: "MTN",    source: "Demo MTN Adapter" },
  { id: "glo",    label: "GLO",    source: "Demo Glo Adapter" },
  { id: "airtel", label: "AIRTEL", source: "Demo Airtel Adapter" }
];

type Step = "number" | "provider" | "done";

export default function CallsPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("number");
  const [msisdn, setMsisdn] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const numberValid = msisdn.replace(/[^\d]/g, "").length >= 7;

  function startRequest() {
    setStep("number"); setMsisdn(""); setProvider(null); setReference(null); setOpen(true);
  }
  function close() { setOpen(false); }

  function submitRequest() {
    const p = PROVIDERS.find(x => x.id === provider);
    const ref = `CDR-REQ-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setReference(ref);
    setStep("done");
    // Demo only: no request leaves the browser. To wire this up,
    // POST { msisdn, provider: p?.source } to a synthetic /api/cdr/request route.
    void p;
  }

  return (
    <div className="page">
      <PageHeader
        crumbs={["INVESTIGATION", "CALLS"]}
        title="Call Details Records"
        description="Synthetic call records and CDR request workflow. No request is transmitted to NCC or any carrier in this demo."
        action={
          <button className="btn primary" onClick={startRequest}>
            <Plus size={13} /> New CDR Request
          </button>
        }
      />

      <div className="strip" style={{ marginBottom: 20 }}>
        <div className="cell"><div className="k">Records Available</div><div className="v">{CDR_RECORDS.length}</div><div className="s">synthetic</div></div>
        <div className="cell"><div className="k">Providers</div><div className="v">{PROVIDERS.length}</div><div className="s">demo adapters</div></div>
        <div className="cell"><div className="k">Open Requests</div><div className="v">{reference ? 1 : 0}</div><div className="s">queued (demo)</div></div>
        <div className="cell"><div className="k">Source</div><div className="v" style={{ fontSize: 13, paddingTop: 6 }}>NCC FORM</div><div className="s">request template</div></div>
      </div>

      <section className="panel">
        <div className="panel-h">
          <h3>Call Records</h3>
          <Badge tone="warm">SYNTHETIC</Badge>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Record ID</th><th>Timestamp</th><th>A-Party</th><th>B-Party</th>
              <th>Direction</th><th>Duration</th><th>Cell ID</th><th>Provider</th>
            </tr>
          </thead>
          <tbody>
            {CDR_RECORDS.map(r => (
              <tr key={r.id}>
                <td className="id">{r.id}</td>
                <td className="tnum">{fullTime(r.ts)}</td>
                <td className="mono">{r.a}</td>
                <td className="mono">{r.b}</td>
                <td>{r.dir}</td>
                <td className="tnum">{r.dur}</td>
                <td className="id">{r.cell}</td>
                <td>{r.provider}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="page-footer">
        <span>All CDR values are synthetic demo data.</span>
        <span>No carrier or NCC system is contacted.</span>
      </div>

      <Modal
        open={open}
        title="API Request Form from NCC"
        subtitle={step === "number" ? "Step 1 of 2 — subscriber" : step === "provider" ? "Step 2 of 2 — service provider" : "Request queued"}
        onClose={close}
        footer={
          step === "number" ? (
            <>
              <button className="btn ghost" onClick={close}>Cancel</button>
              <button className="btn primary" disabled={!numberValid} onClick={() => setStep("provider")}>Continue</button>
            </>
          ) : step === "provider" ? (
            <>
              <button className="btn ghost" onClick={() => setStep("number")}>Back</button>
              <button className="btn primary" disabled={!provider} onClick={submitRequest}>Submit</button>
            </>
          ) : (
            <button className="btn primary" onClick={close}>Close</button>
          )
        }
      >
        {step === "number" && (
          <>
            <div className="field">
              <label>Phone Number</label>
              <input
                className="input mono"
                placeholder="+234 800 000 0000"
                value={msisdn}
                onChange={e => setMsisdn(e.target.value)}
                inputMode="tel"
                autoFocus
              />
            </div>
            <div className="notice">
              Demo environment — this form is not transmitted to the NCC or any carrier.
            </div>
          </>
        )}

        {step === "provider" && (
          <>
            <div className="field">
              <label>Service Provider</label>
              <div className="provider-grid">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`provider-opt ${provider === p.id ? "sel" : ""}`}
                    onClick={() => setProvider(p.id)}
                  >
                    <span className="rd" />
                    <span style={{ fontWeight: 600 }}>{p.label}</span>
                    <span className="dim" style={{ marginLeft: "auto", fontSize: 11 }}>{p.source}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="kv">
              <div className="k">Phone Number</div>
              <div className="v mono">{msisdn}</div>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CheckCircle2 size={16} style={{ color: "var(--success)", marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Request queued (demo)</div>
                <div className="muted" style={{ marginTop: 2 }}>
                  No data was transmitted. This is a synthetic confirmation.
                </div>
              </div>
            </div>
            <div className="kv">
              <div className="k">Reference</div>
              <div className="v mono">{reference}</div>
              <div className="k">Phone Number</div>
              <div className="v mono">{msisdn}</div>
              <div className="k">Provider</div>
              <div className="v">{PROVIDERS.find(p => p.id === provider)?.label}</div>
              <div className="k">Status</div>
              <div className="v"><Badge tone="warn">QUEUED — DEMO</Badge></div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}