"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authorizationId, setA] = useState("A-102");
  const [password, setP] = useState("Demo@2026");
  const [caseRef, setC] = useState("CASE-2026-9941A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login({ authorizationId, password, caseRef });
      sessionStorage.setItem(
        "pending-auth",
        JSON.stringify({ authorizationId, caseRef })
      );
      router.push("/mfa");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <div className="wordmark">IMEI TRIANGULATOR</div>
            <div className="descriptor">INVESTIGATIVE INTELLIGENCE</div>
          </Link>
          <p className="blurb">
            Secure investigative operations platform. This is a demonstration prototype
            using synthetic telecommunications records only. No live carrier systems are
            accessed.
          </p>
        </div>
        <div className="status-row">
          <span className="dot" /> SECURE ENVIRONMENT · DEMO
        </div>
      </aside>

      <main className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <h2>Access Request</h2>
          <p className="sub">Authorized personnel only. All actions are audited.</p>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="field">
              <label htmlFor="auth-id">Authorization ID</label>
              <input
                id="auth-id"
                className="input mono"
                value={authorizationId}
                onChange={e => setA(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label htmlFor="auth-pw">Password</label>
              <input
                id="auth-pw"
                className="input"
                type="password"
                value={password}
                onChange={e => setP(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label htmlFor="auth-case">Case / Warrant Reference</label>
              <input
                id="auth-case"
                className="input mono"
                value={caseRef}
                onChange={e => setC(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="submit" disabled={loading}>
            <Lock size={13} />
            {loading ? "Verifying…" : "Continue Securely"}
          </button>

          <div className="demo-block">
            <div className="lbl">DEMO CREDENTIALS</div>
            <div>
              <code>A-102</code> · <code>Demo@2026</code> · <code>CASE-2026-9941A</code>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}