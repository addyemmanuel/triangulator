"use client";
import { useMemo } from "react";

type Node = { id: string; kind: "device"|"imei"|"imei2"|"iccid"|"msisdn"|"subscriber"|"target"; label: string; sub?: string };

export function IdentityGraph({
  target, device, relatedTargets, selectedId, onSelect
}: {
  target: any; device: any; relatedTargets: any[];
  selectedId: string | null; onSelect: (id: string) => void;
}) {
  const nodes = useMemo<Node[]>(() => {
    const out: Node[] = [
      { id: `target:${target.id}`, kind: "target", label: target.id, sub: "TARGET" },
      { id: `device:${device.id}`, kind: "device", label: device.model, sub: "DEVICE" },
      { id: `imei:${device.imei}`, kind: "imei", label: device.imei, sub: "IMEI" },
      { id: `imei2:${device.imei2}`, kind: "imei2", label: device.imei2, sub: "IMEI2" },
      { id: `iccid:${target.iccid}`, kind: "iccid", label: target.iccid, sub: "ICCID" },
      { id: `msisdn:${target.msisdn}`, kind: "msisdn", label: target.msisdn, sub: "MSISDN" },
      { id: `sub:${target.subscriber}`, kind: "subscriber", label: target.subscriber, sub: "SUBSCRIBER" }
    ];
    for (const r of relatedTargets.slice(0, 4)) {
      out.push({ id: `imei:${r.imei}`, kind: "imei", label: r.imei, sub: "IMEI" });
      out.push({ id: `target:${r.id}`, kind: "target", label: r.id, sub: "TARGET" });
    }
    return out;
  }, [target, device, relatedTargets]);

  const edges: Array<[string, string]> = useMemo(() => {
    const out: Array<[string, string]> = [
      [`target:${target.id}`, `device:${device.id}`],
      [`device:${device.id}`, `imei:${device.imei}`],
      [`device:${device.id}`, `imei2:${device.imei2}`],
      [`imei:${device.imei}`, `iccid:${target.iccid}`],
      [`iccid:${target.iccid}`, `msisdn:${target.msisdn}`],
      [`msisdn:${target.msisdn}`, `sub:${target.subscriber}`]
    ];
    for (const r of relatedTargets) {
      out.push([`imei:${device.imei}`, `imei:${r.imei}`]);
      out.push([`imei:${r.imei}`, `target:${r.id}`]);
    }
    return out;
  }, [target, device, relatedTargets]);

  const W = 760, H = 520;
  const positions: Record<string, [number, number]> = {};
  const centerX = W / 2;
  const centerY = H / 2;
  const ordered: Node[] = [];
  const nodeById: Record<string, Node> = {};
  for (const n of nodes) if (!nodeById[n.id]) { nodeById[n.id] = n; ordered.push(n); }

  ordered.forEach((n, i) => {
    if (n.kind === "device") { positions[n.id] = [centerX, centerY - 80]; return; }
    if (n.kind === "imei") { positions[n.id] = [centerX, centerY - 20]; return; }
    if (n.kind === "imei2") { positions[n.id] = [centerX + 130, centerY - 20]; return; }
    if (n.kind === "iccid") { positions[n.id] = [centerX - 130, centerY + 40]; return; }
    if (n.kind === "msisdn") { positions[n.id] = [centerX - 130, centerY + 100]; return; }
    if (n.kind === "subscriber") { positions[n.id] = [centerX - 130, centerY + 160]; return; }
    if (n.kind === "target" && n.id !== `target:${target.id}`) {
      const idx = ordered.filter(o => o.kind === "target" && o.id !== `target:${target.id}`).findIndex(o => o.id === n.id);
      positions[n.id] = [centerX + 200 + idx * 40, centerY + 40 + idx * 50]; return;
    }
    positions[n.id] = [centerX + 200 + i * 20, centerY + 60 + i * 20];
  });

  const isHighlighted = (id: string) => {
    if (!selectedId) return false;
    if (id === selectedId) return true;
    return edges.some(([a, b]) => (a === selectedId && b === id) || (b === selectedId && a === id));
  };

  return (
    <div className="graph-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }} aria-label="Identity relationship graph">
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#D9DEE3" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" />

        {edges.map(([a, b], i) => {
          const pa = positions[a], pb = positions[b];
          if (!pa || !pb) return null;
          const active = isHighlighted(a) && isHighlighted(b);
          return <line key={i} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]}
            stroke={active ? "var(--accent)" : "#C7CFD6"} strokeWidth={active ? 1.5 : 1} />;
        })}

        {ordered.map(n => {
          const [x, y] = positions[n.id] ?? [W/2, H/2];
          const sel = selectedId === n.id;
          const hi = isHighlighted(n.id);
          return (
            <g key={n.id} onClick={() => onSelect(n.id)} style={{ cursor: "pointer" }}>
              {n.kind === "device" && <rect x={x-8} y={y-8} width={16} height={16} rx={2} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "imei" && <rect x={x-7} y={y-7} width={14} height={14} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "imei2" && <rect x={x-7} y={y-7} width={14} height={14} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "iccid" && <circle cx={x} cy={y} r={7} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "msisdn" && <polygon points={`${x},${y-8} ${x+8},${y} ${x},${y+8} ${x-8},${y}`} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "subscriber" && <polygon points={`${x},${y-9} ${x+9},${y+3} ${x-9},${y+3}`} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}
              {n.kind === "target" && <rect x={x-10} y={y-6} width={20} height={12} rx={6} fill={sel ? "var(--accent)" : "#FFFFFF"} stroke="var(--accent-2)" strokeWidth={1.4} />}

              <text x={x + 12} y={y + 3} fontSize={10} fontFamily="JetBrains Mono, monospace" fill={sel || hi ? "var(--accent)" : "var(--text)"} fontWeight={sel ? 600 : 500}>{n.label}</text>
              {n.sub && <text x={x + 12} y={y + 14} fontSize={8.5} fill="#8B96A1" letterSpacing="0.08em">{n.sub}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}