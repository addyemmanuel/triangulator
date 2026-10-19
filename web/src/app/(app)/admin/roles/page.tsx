"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function AdminRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { api.adminRoles().then(rs => { setRoles(rs); setSel(rs[0]?.id); }); }, []);
  const role = roles.find(r => r.id === sel);

  const groups: Record<string, string[]> = {
    Cases: ["cases.read","cases.write","cases.assign"],
    Intelligence: ["intelligence.read"],
    "Network Data": ["network.read"],
    Evidence: ["evidence.read","evidence.write"],
    Audit: ["audit.read"],
    Administration: ["admin.users","admin.roles","admin.integrations","admin.compliance","compliance.read","compliance.write"]
  };

  return (
    <div className="page">
      <PageHeader crumbs={["ADMINISTRATION", "ROLES & PERMISSIONS"]} title="Roles & Permissions"
        description="Four synthetic roles. Permissions are grouped by capability." />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, alignItems: "start" }}>
        <section className="panel">
          <div className="panel-h"><h3>Roles</h3></div>
          <div className="panel-b" style={{ display: "grid", gap: 6 }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => setSel(r.id)} className="btn ghost"
                style={{
                  justifyContent: "flex-start",
                  borderLeft: sel === r.id ? "2px solid var(--accent)" : "2px solid transparent",
                  color: sel === r.id ? "var(--accent)" : "var(--text)",
                  fontWeight: sel === r.id ? 600 : 500
                }}>{r.name}</button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-h"><h3>{role?.name ?? "Permissions"}</h3></div>
          <div className="panel-b">
            {!role ? <p className="dim">Select a role.</p> : (
              <>
                <p className="muted" style={{ marginTop: 0, fontSize: 12 }}>{role.description}</p>
                {Object.entries(groups).map(([g, perms]) => (
                  <div key={g} style={{ marginTop: 16 }}>
                    <div className="label" style={{ marginBottom: 6 }}>{g}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {perms.map(p => {
                        const on = role.permissions.includes(p);
                        return <Badge key={p} tone={on ? "acc" : "neutral"} mono>{on ? "✓" : "·"} {p}</Badge>;
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}