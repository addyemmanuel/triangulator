"use client";
import { useCallback, useMemo, useRef } from "react";
import { shortTime } from "@/lib/format";

export function EventTimeline({
  events,
  selectedId,
  onSelect
}: {
  events: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sliced = useMemo(() => events.slice(-28), [events]);
  const railRef = useRef<HTMLDivElement>(null);

  const move = useCallback((dir: -1 | 1) => {
    if (!sliced.length) return;
    const idx = sliced.findIndex(e => e.id === selectedId);
    const next = idx === -1 ? 0 : Math.min(sliced.length - 1, Math.max(0, idx + dir));
    const id = sliced[next].id;
    onSelect(id);
    const el = railRef.current?.querySelector<HTMLButtonElement>(`[data-node="${id}"]`);
    el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [sliced, selectedId, onSelect]);

  const onKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); if (sliced.length) onSelect(sliced[0].id); }
    else if (e.key === "End") { e.preventDefault(); if (sliced.length) onSelect(sliced[sliced.length - 1].id); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); }
  };

  if (sliced.length === 0) return null;

  const start = new Date(sliced[0].timestamp).getTime();
  const end = new Date(sliced[sliced.length - 1].timestamp).getTime();
  const span = Math.max(1, end - start);

  return (
    <div className="timeline-rail" ref={railRef}>
      <div className="rail" role="listbox" aria-label="Event timeline" aria-orientation="horizontal">
        <div className="axis" aria-hidden />
        {sliced.map(e => {
          const t = new Date(e.timestamp).getTime();
          const pct = ((t - start) / span) * 100;
          const sel = selectedId === e.id;
          return (
            <div key={e.id} className={`node ${sel ? "sel" : ""}`} style={{ left: `${pct}%` }} role="option" aria-selected={sel}>
              <span className="lbl" aria-hidden>{shortTime(e.timestamp)}</span>
              <button
                type="button"
                data-node={e.id}
                className="p"
                aria-label={`Event ${e.id} at ${shortTime(e.timestamp)} on cell ${e.cellId}`}
                tabIndex={sel ? 0 : -1}
                onClick={() => onSelect(e.id)}
                onKeyDown={(ev) => onKeyDown(ev, e.id)}
              />
              <span className="cell mono" aria-hidden>{e.cellId}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}