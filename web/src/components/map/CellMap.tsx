"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Marker, Popup,
  Tooltip, ZoomControl, ScaleControl, useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LAGOS_CENTER: [number, number] = [6.4478, 3.4230];
const DEFAULT_ZOOM = 12;

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY ?? "";

const BASEMAPS = {
  voyager: {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    attribution: '© OpenStreetMap · © CARTO · <strong>SYNTHETIC DATA</strong>',
    label: "Standard"
  },
  positron: {
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    attribution: '© OpenStreetMap · © CARTO · <strong>SYNTHETIC DATA</strong>',
    label: "Muted"
  }
} as const;

const R_EARTH = 6371000;
const mToLat = (m: number) => (m / R_EARTH) * (180 / Math.PI);
const mToLng = (m: number, lat: number) =>
  (m / (R_EARTH * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

// Sector polygon from a cell position, azimuth (0=N, 90=E), half-angle, range meters.
function sectorPolygon(
  lat: number, lng: number, azimuth: number, halfAngle: number, rangeMeters: number
): [number, number][] {
  const pts: [number, number][] = [[lat, lng]];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const angle = azimuth - halfAngle + (2 * halfAngle) * (i / steps);
    const rad = (angle * Math.PI) / 180;
    const dx = rangeMeters * Math.sin(rad);
    const dy = rangeMeters * Math.cos(rad);
    pts.push([lat + mToLat(dy), lng + mToLng(dx, lat)]);
  }
  pts.push([lat, lng]);
  return pts;
}

// Deterministic offset so the device position is stable per event ID.
function pseudoOffset(seed: string, lat: number, lng: number) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const bearing = h % 360;
  const distM = 90 + (h % 170); // 90–260 m
  const rad = (bearing * Math.PI) / 180;
  const dx = distM * Math.sin(rad);
  const dy = distM * Math.cos(rad);
  return {
    lat: lat + mToLat(dy),
    lng: lng + mToLng(dx, lat),
    distanceM: distM,
    bearing
  };
}

// DivIcon for the cell marker — diamond that matches the app language.
const cellIcon = (selected: boolean) =>
  L.divIcon({
    className: "cell-marker",
    html: `<svg width="18" height="18" viewBox="0 0 18 18">
      <rect x="3" y="3" width="12" height="12" transform="rotate(45 9 9)"
        fill="${selected ? "#356B72" : "#FFFFFF"}"
        stroke="#66758A" stroke-width="1.4" />
    </svg>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

// Map behaviour: recenter and fly to selection.
function MapController({
  focus, selectedEventId
}: { focus: [number, number] | null; selectedEventId: string | null }) {
  const map = useMap();
  const lastEvent = useRef<string | null>(null);
  useEffect(() => {
    if (focus && selectedEventId && selectedEventId !== lastEvent.current) {
      lastEvent.current = selectedEventId;
      map.flyTo(focus, Math.max(map.getZoom(), 14), { duration: 0.7 });
    }
  }, [focus, selectedEventId, map]);
  return null;
}

export function CellMap({
  cells,
  events,
  selectedEventId,
  onSelectEvent,
  onSelectCell,
  basemap = "voyager"
}: {
  cells: any[];
  events: any[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onSelectCell: (id: string) => void;
  basemap?: keyof typeof BASEMAPS;
}) {
  const selectedEvent = useMemo(
    () => events.find(e => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );
  const selectedCell = useMemo(
    () => (selectedEvent ? cells.find(c => c.id === selectedEvent.cellId) ?? null : null),
    [selectedEvent, cells]
  );

  // Simulated device position for the selected event.
  const devicePos = useMemo(() => {
    if (!selectedEvent || !selectedCell) return null;
    const off = pseudoOffset(selectedEvent.id, selectedCell.lat, selectedCell.lng);
    return { ...off, cellLat: selectedCell.lat, cellLng: selectedCell.lng };
  }, [selectedEvent, selectedCell]);

  // Group events by cell for cluster dots.
  const eventsByCell = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const e of events) {
      const arr = m.get(e.cellId) ?? [];
      arr.push(e);
      m.set(e.cellId, arr);
    }
    return m;
  }, [events]);

  return (
    <div className="map-wrap">
      <div className="map-overlay-tl">
        <div style={{ fontWeight: 600 }}>NETWORK-BASED LOCATION VIEW</div>
        <div style={{ color: "var(--text-3)" }}>
          SYNTHETIC DEMO DATA · CONFIDENCE: MEDIUM
        </div>
      </div>

      <div className="map-overlay-tr">
        <span className="badge acc">approx. cell-based</span>
        <span className="badge">not GPS</span>
      </div>

      <MapContainer
        center={LAGOS_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", background: "#EEF0F2" }}
      >
        <TileLayer
          url={BASEMAPS[basemap].url}
          attribution={BASEMAPS[basemap].attribution}
          subdomains="abcd"
          maxZoom={19}
        />

        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" imperial={false} />

        {/* sector wedges — bottom layer */}
        {cells.map(c =>
          c.sectors.map((s: any) => {
            const isSel = selectedCell?.id === c.id;
            const positions = sectorPolygon(c.lat, c.lng, s.azimuth, 30, s.range);
            return (
              <Polygon
                key={`${c.id}-${s.id}`}
                positions={positions}
                pathOptions={{
                  color: isSel ? "rgba(53,107,114,0.75)" : "rgba(102,117,138,0.45)",
                  weight: isSel ? 1.4 : 1,
                  fillColor: isSel ? "#356B72" : "#66758A",
                  fillOpacity: isSel ? 0.22 : 0.10
                }}
              />
            );
          })
        )}

        {/* event cluster markers */}
        {Array.from(eventsByCell.entries()).map(([cellId, evs]) => {
          const cell = cells.find(c => c.id === cellId);
          if (!cell) return null;
          const first = evs[0];
          const off = pseudoOffset(first.id, cell.lat, cell.lng);
          const anySelected = evs.some(e => e.id === selectedEventId);
          return (
            <CircleMarker
              key={cellId}
              center={[off.lat, off.lng]}
              radius={anySelected ? 8 : 6}
              pathOptions={{
                color: "#FFFFFF",
                weight: 1.5,
                fillColor: anySelected ? "#356B72" : "#66758A",
                fillOpacity: 0.95
              }}
              eventHandlers={{ click: () => onSelectEvent(first.id) }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1} className="cellmap-tip">
                <div style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{cellId}</div>
                <div style={{ fontSize: 10, color: "#66717C" }}>
                  {evs.length} synthetic event{evs.length === 1 ? "" : "s"}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* cell markers — top layer */}
        {cells.map(c => {
          const isSel = selectedCell?.id === c.id;
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={cellIcon(isSel)}
              eventHandlers={{
                click: () => {
                  onSelectCell(c.id);
                }
              }}
            >
              <Tooltip direction="right" offset={[10, 0]} opacity={1} className="cellmap-tip">
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600 }}>
                  {c.id}
                </div>
                <div style={{ fontSize: 10, color: "#66717C" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#66717C" }}>
                  {c.sectors.length} sector{c.sectors.length === 1 ? "" : "s"} · {c.provider}
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* device proximity — only when an event is selected */}
        {selectedCell && devicePos && (
          <>
            <Polyline
              positions={[
                [devicePos.cellLat, devicePos.cellLng],
                [devicePos.lat, devicePos.lng]
              ]}
              pathOptions={{
                color: "#356B72",
                weight: 1.4,
                dashArray: "4 4",
                opacity: 0.9
              }}
            />
            <CircleMarker
              center={[devicePos.lat, devicePos.lng]}
              radius={9}
              pathOptions={{
                color: "#356B72",
                weight: 1.6,
                fillColor: "#FFFFFF",
                fillOpacity: 1
              }}
            >
              <Popup autoPan={false} closeButton={false}>
                <div style={{ fontSize: 11 }}>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                    SIMULATED DEVICE POSITION
                  </div>
                  <div style={{ color: "#66717C" }}>
                    {devicePos.distanceM.toFixed(0)} m from {selectedCell.id}
                  </div>
                  <div style={{ color: "#66717C" }}>
                    bearing {devicePos.bearing.toFixed(0)}° · synthetic
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        <MapController
          focus={
            devicePos
              ? [devicePos.lat, devicePos.lng]
              : selectedCell
              ? [selectedCell.lat, selectedCell.lng]
              : null
          }
          selectedEventId={selectedEventId}
        />
      </MapContainer>

      {selectedEvent && selectedCell && devicePos && (
        <div className="selected-pill" role="status" aria-live="polite">
          <span className="dim">SELECTED</span>
          <span className="id">{selectedEvent.id}</span>
          <span className="mono">{selectedCell.id} · {selectedEvent.sector}</span>
          <span className="mono dim">≈ {devicePos.distanceM.toFixed(0)} m</span>
        </div>
      )}

      <div className="map-overlay-bl">
        <div className="map-legend">
          <span className="it">
            <svg width={12} height={12}>
              <rect
                x={2} y={2} width={8} height={8}
                transform="rotate(45 6 6)"
                fill="#FFFFFF" stroke="#66758A" strokeWidth={1.3}
              />
            </svg>
            Cell site
          </span>
          <span className="it">
            <svg width={12} height={12}>
              <polygon
                points="6,1 11,10 1,10"
                fill="rgba(102,117,138,0.25)"
                stroke="rgba(102,117,138,0.6)"
              />
            </svg>
            Sector
          </span>
          <span className="it">
            <svg width={10} height={10}>
              <circle cx={5} cy={5} r={4} fill="#66758A" stroke="#FFF" strokeWidth={1} />
            </svg>
            Event cluster
          </span>
          <span className="it">
            <svg width={12} height={12}>
              <circle cx={6} cy={6} r={4} fill="#FFFFFF" stroke="#356B72" strokeWidth={1.5} />
            </svg>
            Simulated device
          </span>
        </div>
      </div>
    </div>
  );
}