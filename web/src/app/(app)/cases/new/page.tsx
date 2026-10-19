"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";

const steps = ["01 CASE", "02 AUTHORIZATION", "03 TARGET", "04 REVIEW"];

export default function NewInvestigation() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    caseId: "CASE-2026-9945A", title: "", purpose: "", priority: "medium", investigator: "A. ADEYEMI",
    authRef: "AUTH-DEMO-2026-0044", authType: "Internal authorization (demo)", from: "2026-06-15", until: "2026-08-15",
    target: "TARGET-009", imei: "352099781234642", imei2: "352099781234650", msisdn: "+234 800 000 9900",
    notes: ""
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page">
      <PageHeader crumbs={["CASE MANAGEMENT", "NEW INVESTIGATION"]} title="New Investigation"
        description="Four-step intake. All fields produce synthetic records on submission." />

      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "1px solid var(--border)" }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className="btn ghost"
            style={{
              padding: "10px 16px", borderBottom: i === step ? "2px solid var(--accent)" : "2px solid transparent",
              color: i === step ? "var(--accent)" : "var(--text-2)", fontWeight: i === step ? 600 : 500, borderRadius: 0
            }}>{s}</button>
        ))}
      </div>

      <div className="panel" style={{ maxWidth: 880 }}>
        <div className="panel-b" style={{ display: "grid", gap: 14 }}>
          {step === 0 && (<>
            <div className="field"><label>Case ID</label><input className="input mono" value={form.caseId} onChange={e => set("caseId", e.target.value)} /></div>
            <div className="field"><label>Investigation title</label><input className="input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Short working title" /></div>
            <div className="field"><label>Purpose</label><textarea className="textarea" rows={3} value={form.purpose} onChange={e => set("purpose", e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Priority</label>
                <select className="select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select></div>
              <div className="field"><label>Assigned investigator</label>
                <select className="select" value={form.investigator} onChange={e => set("investigator", e.target.value)}>
                  <option>A. ADEYEMI</option><option>N. CHUKWU</option>
                </select></div>
            </div>
          </>)}

          {step === 1 && (<>
            <div className="field"><label>Authorization / reference number</label><input className="input mono" value={form.authRef} onChange={e => set("authRef", e.target.value)} /></div>
            <div className="field"><label>Authorization type</label>
              <select className="select" value={form.authType} onChange={e => set("authType", e.target.value)}>
                <option>Internal authorization (demo)</option>
                <option>Judicial warrant (demo)</option>
                <option>Executive authorization (demo)</option>
              </select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Valid from</label><input className="input" type="date" value={form.from} onChange={e => set("from", e.target.value)} /></div>
              <div className="field"><label>Valid until</label><input className="input" type="date" value={form.until} onChange={e => set("until", e.target.value)} /></div>
            </div>
            <div className="field"><label>Supporting document</label>
              <div style={{ border: "1px dashed var(--border-strong)", padding: 18, borderRadius: 4, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
                Drop file to attach (simulated — no file leaves your browser)
              </div></div>
          </>)}

          {step === 2 && (<>
            <div className="field"><label>Target identifier</label><input className="input mono" value={form.target} onChange={e => set("target", e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>IMEI</label><input className="input mono" value={form.imei} onChange={e => set("imei", e.target.value)} /></div>
              <div className="field"><label>IMEI2</label><input className="input mono" value={form.imei2} onChange={e => set("imei2", e.target.value)} /></div>
            </div>
            <div className="field"><label>MSISDN</label><input className="input mono" value={form.msisdn} onChange={e => set("msisdn", e.target.value)} /></div>
            <div className="field"><label>Target notes</label><textarea className="textarea" rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          </>)}

          {step === 3 && (<>
            <div className="kv">
              <div className="k">Case ID</div><div className="v mono">{form.caseId}</div>
              <div className="k">Title</div><div className="v">{form.title || "—"}</div>
              <div className="k">Priority</div><div className="v"><Badge tone="warm">{form.priority}</Badge></div>
              <div className="k">Investigator</div><div className="v">{form.investigator}</div>
              <div className="k">Authorization</div><div className="v mono">{form.authRef}</div>
              <div className="k">Valid</div><div className="v mono">{form.from} → {form.until}</div>
              <div className="k">Target</div><div className="v mono">{form.target}</div>
              <div className="k">IMEI</div><div className="v mono">{form.imei}</div>
              <div className="k">IMEI2</div><div className="v mono">{form.imei2}</div>
              <div className="k">MSISDN</div><div className="v mono">{form.msisdn}</div>
            </div>
            <p className="dim" style={{ fontSize: 11, marginTop: 8 }}>
              Creating an investigation writes a synthetic audit event and is recorded against badge A-102.
            </p>
          </>)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: 14, borderTop: "1px solid var(--border)" }}>
          <button className="btn" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
          {step < 3
            ? <button className="btn primary" onClick={() => setStep(s => Math.min(3, s + 1))}>Continue</button>
            : <button className="btn primary" onClick={() => router.push("/cases/CASE-2026-9941A")}>Create Investigation</button>}
        </div>
      </div>
    </div>
  );
}