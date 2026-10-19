export function Empty({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div className="label" style={{ marginBottom: 6 }}>{title}</div>
      <div className="muted" style={{ maxWidth: 420, margin: "0 auto 14px" }}>{message}</div>
      {action}
    </div>
  );
}