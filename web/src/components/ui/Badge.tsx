export function Badge({ tone = "neutral", mono, children }: { tone?: "neutral"|"ok"|"warn"|"crit"|"acc"|"warm"; mono?: boolean; children: React.ReactNode }) {
  const cls = ["badge", tone !== "neutral" ? tone : "", mono ? "mono" : ""].join(" ");
  return <span className={cls}>{children}</span>;
}
export function StatusDot({ tone }: { tone: "ok"|"warn"|"crit"|"acc" }) { return <span className={`dot ${tone}`} />; }