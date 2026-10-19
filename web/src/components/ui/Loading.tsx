export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div style={{ padding: 14, display: "grid", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {Array.from({ length: cols }).map((__, j) => <div key={j} className="sk" style={{ height: 14 }} />)}
        </div>
      ))}
    </div>
  );
}
export function SkeletonBlock({ h = 320 }: { h?: number }) { return <div className="sk" style={{ height: h }} />; }