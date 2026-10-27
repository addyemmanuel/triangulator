"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
            using synthetic telecommunications records only.
          </p>
        </div>
        <div className="status-row">
          <span className="dot" /> SECURE ENVIRONMENT · SUPABASE AUTH
        </div>
      </aside>

      <main className="auth-form-side">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Access Request</h2>
          <p className="sub">Authorized personnel only. All actions are audited.</p>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="submit" disabled={loading}>
            <Lock size={13} />
            {loading ? "Verifying…" : "Sign In"}
          </button>

         
        </form>
      </main>
    </div>
  );
}