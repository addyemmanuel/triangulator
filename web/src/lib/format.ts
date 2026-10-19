export function shortTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
}
export function fullTime(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().slice(0,10);
  return `${date} ${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
}
export function relTime(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
export function humanizeId(id: string) { return id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }