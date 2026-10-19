"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Lock } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hooks & primitives                                                 */
/* ------------------------------------------------------------------ */

function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 620ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 620ms cubic-bezier(.2,.7,.2,1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

function Counter({ to, duration = 900 }: { to: number; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{n}</span>;
}

function LiveClock() {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!t) return <span className="mono">--:--:--</span>;
  return <span className="mono">{t.toISOString().slice(11, 19)} UTC</span>;
}

/* ------------------------------------------------------------------ */
/*  Session feed                                                       */
/* ------------------------------------------------------------------ */

const FEED = [
  { t: "14:42:03", a: "session opened · A-102" },
  { t: "14:42:09", a: "case.opened · CASE-2026-9941A" },
  { t: "14:42:14", a: "device.profile_query · 352099…4567" },
  { t: "14:42:20", a: "network.events_query · 22 records" },
  { t: "14:42:26", a: "cells.list_query · 8 synthetic cells" },
  { t: "14:42:33", a: "anomalies.list_query · 3 indicators" },
  { t: "14:42:39", a: "evidence.added · EVD-0001" },
  { t: "14:42:45", a: "evidence.report_generated" }
];

function SessionFeed() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x + 1) % FEED.length), 2000);
    return () => clearInterval(id);
  }, []);
  const visible = useMemo(() => {
    const out: typeof FEED = [];
    for (let k = 3; k >= 0; k--) {
      const idx = (i - k + FEED.length) % FEED.length;
      out.push({ ...FEED[idx], isLatest: k === 0 } as any);
    }
    return out;
  }, [i]);
  return (
    <div className="session-feed">
      <div className="hd">
        <span className="dot live" />
        SESSION AUDIT — LIVE
      </div>
      <div className="body">
        {visible.map((line: any, k) => (
          <div key={`${i}-${k}`} className={`line ${line.isLatest ? "now" : ""}`}>
            <span className="t">{line.t}</span>
            <span className="a">{line.a}</span>
          </div>
        ))}
      </div>
      <span className="cursor" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero visual — animated, interactive                                */
/* ------------------------------------------------------------------ */

type EventNode = { x: number; y: number; id: string };

const NODES: EventNode[] = [
  { x: 160, y: 85, id: "CELL-001" },
  { x: 305, y: 125, id: "CELL-002" },
  { x: 85, y: 285, id: "CELL-003" },
  { x: 315, y: 305, id: "CELL-004" }
];

function HeroVisual() {
  const wrap = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [hover, setHover] = useState<number | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  }

  const tiltX = (pos.x - 0.5) * 10;
  const tiltY = (pos.y - 0.5) * 10;

  return (
    <div
      className="hero-visual"
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={() => { setPos({ x: 0.5, y: 0.5 }); setHover(null); }}
    >
      <svg
        viewBox="0 0 400 400"
        style={{
          transform: `perspective(900px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`,
          transition: "transform 220ms cubic-bezier(.2,.7,.2,1)"
        }}
      >
        <defs>
          <pattern id="lg" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B2632" strokeWidth="0.7" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(53,107,114,0.35)" />
            <stop offset="100%" stopColor="rgba(53,107,114,0)" />
          </radialGradient>
        </defs>

        <rect width="400" height="400" fill="url(#lg)" />

        {/* rotating radar sweep */}
        <g style={{ transformOrigin: "200px 200px", animation: "radar 9s linear infinite" }}>
          <path
            d="M 200 200 L 200 40 A 160 160 0 0 1 240 52 Z"
            fill="rgba(53,107,114,0.07)"
          />
          <line x1="200" y1="200" x2="200" y2="40" stroke="#356B72" strokeWidth="0.9" opacity="0.35" />
        </g>

        {/* rings */}
        <circle cx="200" cy="200" r="160" fill="none" stroke="#2C3945" strokeWidth="0.6" strokeDasharray="2 6" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#2C3945" strokeWidth="0.6" strokeDasharray="2 6" />
        <circle cx="200" cy="200" r="80"  fill="none" stroke="#2C3945" strokeWidth="0.6" />

        {/* sectors, breathing */}
        <path
          d="M 200 200 L 260 40 A 200 200 0 0 1 340 120 Z"
          fill="rgba(53,107,114,0.18)"
          stroke="rgba(53,107,114,0.45)"
          strokeWidth="0.9"
          style={{ animation: "sector-pulse 5.5s ease-in-out infinite" }}
        />
        <path
          d="M 200 200 L 340 220 A 200 200 0 0 1 300 340 Z"
          fill="rgba(102,117,138,0.10)"
          stroke="rgba(102,117,138,0.30)"
          strokeWidth="0.8"
          style={{ animation: "sector-pulse 5.5s ease-in-out .8s infinite" }}
        />
        <path
          d="M 200 200 L 100 350 A 200 200 0 0 1 40 240 Z"
          fill="rgba(181,139,82,0.08)"
          stroke="rgba(181,139,82,0.28)"
          strokeWidth="0.8"
          style={{ animation: "sector-pulse 5.5s ease-in-out 1.6s infinite" }}
        />

        {/* marching-dash bearing line to hovered/lead node */}
        <line
          x1="200" y1="200"
          x2={hover !== null ? NODES[hover].x : 260}
          y2={hover !== null ? NODES[hover].y : 130}
          stroke="#356B72"
          strokeWidth="1"
          strokeDasharray="3 3"
          style={{ animation: "dash-march 2s linear infinite", transition: "x2 260ms ease, y2 260ms ease" }}
        />

        {/* pings around each node */}
        {NODES.map((n, i) => (
          <circle
            key={`p-${i}`}
            className="ping"
            cx={n.x}
            cy={n.y}
            r="5"
            fill="none"
            stroke="#356B72"
            strokeWidth="0.9"
            style={{ animationDelay: `${i * 1.1}s` }}
          />
        ))}

        {/* device marker */}
        <circle
          className="device-pulse"
          cx={hover !== null ? NODES[hover].x + 10 : 260}
          cy={hover !== null ? NODES[hover].y - 8 : 130}
          r="5"
          fill="#FFFFFF"
          stroke="#356B72"
          strokeWidth="1.5"
          style={{ transition: "cx 260ms ease, cy 260ms ease" }}
        />

        {/* interactive event nodes */}
        {NODES.map((n, i) => {
          const isHover = hover === i;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer" }}
            >
              {/* invisible hit area */}
              <circle cx={n.x} cy={n.y} r="22" fill="transparent" />
              <rect
                x={n.x - 5}
                y={n.y - 5}
                width="10"
                height="10"
                transform={`rotate(45 ${n.x} ${n.y})`}
                fill={isHover ? "#356B72" : "#FFFFFF"}
                stroke="#66758A"
                strokeWidth="1"
                style={{ transition: "fill 180ms ease" }}
              />
              {isHover && (
                <g>
                  <rect
                    x={n.x + 12}
                    y={n.y - 12}
                    width="92"
                    height="20"
                    rx="3"
                    fill="#17212B"
                    stroke="#2C3945"
                  />
                  <text
                    x={n.x + 20}
                    y={n.y + 2}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fill="#E7EBEF"
                  >
                    {n.id}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* center cell marker */}
        <circle cx="200" cy="200" r="40" fill="url(#glow)" />
        <rect
          x="193" y="193" width="14" height="14"
          transform="rotate(45 200 200)"
          fill="#356B72" stroke="#66758A" strokeWidth="1"
        />
      </svg>

      <div className="hero-feed-wrap">
        <SessionFeed />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chain — clickable, with detail strip                               */
/* ------------------------------------------------------------------ */

const CHAIN = [
  { n: "01", t: "Case",     s: "Authorization & scope",  link: "/cases",                        sample: "CASE-2026-9941A",              meta: "5 demo cases" },
  { n: "02", t: "Target",   s: "Subject under review",   link: "/cases/CASE-2026-9941A",        sample: "TARGET-001",                   meta: "8 demo targets" },
  { n: "03", t: "Device",   s: "IMEI / IMEI2",           link: "/intelligence/device",          sample: "352099781234567",              meta: "10 demo devices" },
  { n: "04", t: "Identity", s: "ICCID · MSISDN",         link: "/intelligence/identity",        sample: "+234 800 000 1421",            meta: "8 subscriber identities" },
  { n: "05", t: "Network",  s: "Synthetic events",       link: "/investigation/events",         sample: "EVT-00042 · Location Update",  meta: "≈130 events" },
  { n: "06", t: "Location", s: "Cell-based estimate",    link: "/intelligence/cells",           sample: "CELL-002 · Sector S1",         meta: "8 demo cells" },
  { n: "07", t: "Analysis", s: "Anomaly indicators",     link: "/investigation/anomalies",      sample: "IMEI Anomaly · high",          meta: "6 indicators" },
  { n: "08", t: "Evidence", s: "Chain of custody",       link: "/investigation/evidence",       sample: "EVD-0001 · verified",          meta: "3 items" },
  { n: "09", t: "Audit",    s: "Immutable log",          link: "/governance/audit",             sample: "case.opened · A-102",          meta: "20+ events" }
];

function ChainFlow() {
  const [sel, setSel] = useState<number>(0);
  const stage = CHAIN[sel];

  return (
    <>
      <div className="chain-flow" role="tablist" aria-label="Investigative chain">
        {CHAIN.map((c, i) => {
          const active = i === sel;
          return (
            <button
              key={c.n}
              role="tab"
              aria-selected={active}
              className={`node ${active ? "active" : ""}`}
              onClick={() => setSel(i)}
            >
              <span className="n">{c.n}</span>
              <span className="t">{c.t}</span>
              <span className="s">{c.s}</span>
            </button>
          );
        })}
      </div>

      <div className="chain-detail" key={stage.n}>
        <div className="cd-left">
          <div className="cd-label">Stage {stage.n} · {stage.t}</div>
          <div className="cd-title">{stage.s}</div>
          <div className="cd-meta">{stage.meta}</div>
        </div>
        <div className="cd-mid">
          <div className="cd-label">Sample record</div>
          <div className="cd-sample mono">{stage.sample}</div>
        </div>
        <div className="cd-right">
          <Link href={stage.link} className="btn-secondary-lg">
            Open section <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA with loading feedback                                          */
/* ------------------------------------------------------------------ */

function EnterButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      className={variant === "primary" ? "btn-primary-lg" : "btn-secondary-lg"}
      disabled={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => router.push("/login"), 420);
      }}
      style={loading ? { opacity: 0.85, cursor: "wait" } : undefined}
    >
      {loading ? (
        <>
          <span className="spinner" /> Opening session…
        </>
      ) : (
        <>
          <Lock size={14} /> Enter Demonstration <ArrowRight size={14} />
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing">
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollPct})` }} aria-hidden />

      <header className="landing-topbar">
        <div className="brand-block">
          <span className="name">IMEI TRIANGULATOR DEMO</span>
          <span className="tag">Investigative Intelligence</span>
        </div>
        <div className="right">
          <span className="clock"><LiveClock /></span>
          <span className="adapter">
            <span className="dot-ok pulse" /> adapters operational
          </span>
       
          <Link href="/login" className="btn-secondary-sm">
            Open Demo <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <Reveal>
            <div className="eyebrow">Demo prototype · Synthetic data only</div>
            <h1>
              Network-based investigative intelligence,
              <br />
              presented as one coherent workstation.
            </h1>
            <p className="lede">
              IMEI TRIANGULATOR is a high-fidelity prototype of the workflow an authorized
              investigator would follow when reviewing device, identity, network, spatial,
              and temporal evidence inside a single case.
            </p>
            <div className="boundary-note">
              This is a demonstration environment. All IMEI, MSISDN, ICCID, subscriber,
              cell-site, and network-event records shown anywhere in the product are
              synthetic. No live carrier, regulator, or government system is contacted.
            </div>
            <div className="cta-row">
              <EnterButton />
              <a href="#boundary" className="btn-secondary-lg">
                <BookOpen size={14} /> Read the boundary
              </a>
            </div>
            <div className="meta-row">
              <span className="m">
                <span className="dot-ok pulse" /> Demo adapters operational
              </span>
              <span className="m">v0.1 · prototype</span>
              <span className="m">Non-operational</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <div className="sec-label">The investigative chain</div>
            <h2>Case → Target → Evidence → Audit</h2>
            <p className="sec-desc">
              Every record in the platform is linked. Select a stage to see a sample record
              and jump to the corresponding section of the workstation.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <ChainFlow />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <div className="sec-label">Session walkthrough</div>
            <h2>What this Demo demonstrates</h2>
            <p className="sec-desc">
              The prototype is built around a single continuous journey — a walk-through that
              shows how device, identity, network, spatial, and temporal information converge
              on one screen.
            </p>
          </Reveal>

          <div className="walkthrough">
            {[
              ["01", "Authenticate", "Badge ID, password, and MFA. Session opens against an authorization reference."],
              ["02", "Open a case",   "Active cases list. Every case carries its authorization, validity window, and investigator."],
              ["03", "Profile target","Device, IMEI, IMEI2, MSISDN, ICCID, subscriber, and current status on one surface."],
              ["04", "Review events", "Dense synthetic event table with timestamp, cell, sector, provider, and confidence."],
              ["05", "Place on map",  "Cell-based location estimate — never GPS, always labeled as approximate."],
              ["06", "Inspect flags", "Indicator-by-indicator review. No scores. No conclusions drawn for the investigator."],
              ["07", "Seal evidence", "Chain of custody from collection through review and verification."],
              ["08", "Read the audit","Every action performed during the session, in order, with authorization context."]
            ].map(([n, t, s], i) => (
              <StepReveal key={n} index={i}>
                <div className="step-inner">
                  <div className="step-n">{n}</div>
                  <div className="step-t">{t}</div>
                  <div className="step-s">{s}</div>
                </div>
              </StepReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="boundary">
        <div className="section-inner">
          <Reveal>
            <div className="sec-label">Boundary</div>
            <h2>What this prototype is, and what it is not</h2>
            <p className="sec-desc">
              The prototype exists to demonstrate a user experience and an investigative
              workflow. It does not perform live telecommunications surveillance, does not track
              devices, or connects to any carrier or government system in realtime.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="boundary">
              <div className="col is">
                <div className="head">What it is</div>
                <ul>
                  <li>A UI/UX demonstration of the product</li>
                  <li>A fictional dataset of cases, targets, devices, identities, and events</li>
                  <li>A provider abstraction shell with simulated MTN, Airtel, Glo, 9mobile, and Government adapters</li>
                  <li>A vehicle for demonstrating authorization, RBAC, chain of custody, and auditability concepts in an interface</li>
                  <li>An entirely non-operational prototype, suitable for presentation</li>
                </ul>
              </div>
              <div className="col isnt">
                <div className="head">What it is not</div>
                <ul>
                  <li>A live telecommunications system</li>
                  <li>A live device tracker</li>
                  <li>A connection to MTN, Airtel, Globacom, 9mobile, the NCC, or any regulator</li>
                  <li>A source of real IMEI, MSISDN, ICCID, subscriber, or location information</li>
                  <li>A product that performs realtime surveillance, lawful interception, or unauthorized tracking</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <div className="sec-label">Data foundation</div>
            <h2>Synthetic dataset</h2>
            <p className="sec-desc">
              Everything the demo shows is generated locally. No network calls leave your
              machine for the purposes of obtaining records — only the map basemap is
              fetched from a public tile service.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="dataset">
              {[
                ["Cases", 5, "3 active · 1 pending · 1 archived"],
                ["Targets", 8, "5 active · 3 closed"],
                ["Devices", 10, "IMEI + IMEI2 pairs"],
                ["Network events", 130, "Across 8 synthetic cells"],
                ["Cell sites", 8, "Demo MTN · Airtel · Glo · 9mobile"],
                ["Anomaly indicators", 6, "High / medium / low severity"],
                ["Audit events", 20, "Seeded · live events appended"],
                ["Provider adapters", 5, "Simulated only"]
              ].map(([k, v, s]) => (
                <div className="cell" key={k as string}>
                  <div className="k">{k}</div>
                  <div className="v">
                    <Counter to={v as number} />
                  </div>
                  <div className="s">{s}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner" style={{ textAlign: "center", padding: "20px 0" }}>
          <Reveal>
            <div className="sec-label" style={{ marginBottom: 20 }}>Enter the demonstration</div>
            <h2 style={{ fontSize: 28, marginBottom: 12 }}>The workstation is ready.</h2>
            <p className="sec-desc" style={{ margin: "0 auto 32px", maxWidth: 520 }}>
              Sign in with the demo credentials on the next screen. Sessions are short-lived,
              audited, and readable only inside the prototype.
            </p>
            <EnterButton />
          </Reveal>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="inner">
          <span>IMEI TRIANGULATOR · Investigative Intelligence — demonstration prototype</span>
          <span>All records synthetic · No carrier integration · Not for operational use</span>
        </div>
      </footer>
    </div>
  );
}

/* Per-step reveal — stagger comes from the index */
function StepReveal({ children, index }: { children: React.ReactNode; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div
      ref={ref}
      className="step"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(10px)",
        transition: `opacity 480ms cubic-bezier(.2,.7,.2,1) ${index * 70}ms, transform 480ms cubic-bezier(.2,.7,.2,1) ${index * 70}ms`
      }}
    >
      {children}
    </div>
  );
}