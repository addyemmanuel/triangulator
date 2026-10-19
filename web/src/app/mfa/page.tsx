"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { ShieldCheck } from "lucide-react";

export default function MfaPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [code, setCode] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { session } = await api.mfa({ code });
      signIn(session);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "MFA failed");
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
            <div className="descriptor">MULTI-FACTOR VERIFICATION</div>
          </Link>
          <ol className="auth-steps">
            <li><span className="marker" /> Identity verified — A-102</li>
            <li><span className="marker" /> Password verified</li>
            <li className="pending"><span className="marker" /> MFA pending</li>
            <li className="todo"><span className="marker" /> Session not yet opened</li>
          </ol>
        </div>
        <div className="status-row">
          <span className="dot" /> SECURITY DEVICE PAIRED
        </div>
      </aside>

      <main className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          <h2>Two-factor confirmation</h2>
          <p className="sub">Enter the 6-digit code from your security device.</p>

          <div className="field">
            <label htmlFor="otp">One-Time Passcode</label>
            <input
              id="otp"
              className="input mono"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoFocus
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="submit" disabled={loading || code.length !== 6}>
            <ShieldCheck size={13} />
            {loading ? "Verifying…" : "Verify & Open Session"}
          </button>

          <div className="demo-block">
            <div className="lbl">DEMO OTP</div>
            <div><code>123456</code></div>
          </div>
        </form>
      </main>
    </div>
  );
}