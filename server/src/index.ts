import "dotenv/config";
import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import { z } from "zod";
import {
  cases, targets, devices, cells, networkEvents, anomalies, evidence,
  auditEvents, users, roles, integrations,
  type AuditEvent
} from "./data.js";
import { adapters } from "./providers.js";

let auditSeq = auditEvents.length;

const log = pino({ level: process.env.LOG_LEVEL ?? "info" });
const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / curl / server-to-server (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());
app.use(pinoHttp({ logger: log }));

const ok = <T>(data: T) => ({ ok: true, data });
const err = (code: string, message: string) => ({ ok: false, error: { code, message } });

// --- health ------------------------------------------------------------------
app.get("/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// --- auth (demo) -------------------------------------------------------------
const loginSchema = z.object({ authorizationId: z.string().min(1), password: z.string().min(1), caseRef: z.string().min(1) });
app.post("/api/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(err("BAD_REQUEST", "Missing fields"));
  const { authorizationId, password } = parsed.data;
  if (authorizationId !== "A-102" || password !== "Demo@2026") {
    return res.status(401).json(err("UNAUTHORIZED", "Demo credentials rejected"));
  }
  return res.json(ok({ stage: "mfa_required", challenge: "OTP-6" }));
});

const mfaSchema = z.object({ code: z.string().length(6) });
app.post("/api/auth/mfa", (req, res) => {
  const parsed = mfaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(err("BAD_REQUEST", "Invalid OTP"));
  if (parsed.data.code !== "123456") return res.status(401).json(err("UNAUTHORIZED", "Demo OTP rejected"));
  return res.json(ok({ session: { user: users[0], issuedAt: new Date().toISOString(), demo: true } }));
});
app.post("/api/auth/logout", (_req, res) => res.json(ok({ loggedOut: true })));

// --- cases -------------------------------------------------------------------
app.get("/api/cases", (_req, res) => res.json(ok(cases)));
app.get("/api/cases/:id", (req, res) => {
  const c = cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json(err("NOT_FOUND", "Case not found"));
  return res.json(ok(c));
});
app.get("/api/cases/:id/targets", (req, res) => {
  const c = cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json(err("NOT_FOUND", "Case not found"));
  return res.json(ok(targets.filter(t => t.caseId === c.id)));
});

// --- targets -----------------------------------------------------------------
app.get("/api/targets/:id", (req, res) => {
  const t = targets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json(err("NOT_FOUND", "Target not found"));
  return res.json(ok(t));
});
app.get("/api/targets/:id/devices", (req, res) => {
  const t = targets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json(err("NOT_FOUND", "Target not found"));
  return res.json(ok(devices.filter(d => d.imei === t.imei || d.imei2 === t.imei2 || d.id === t.deviceId)));
});
app.get("/api/targets/:id/events", (req, res) => {
  const list = networkEvents.filter(e => e.targetId === req.params.id);
  return res.json(ok(list));
});
app.get("/api/targets/:id/timeline", (req, res) => {
  const list = networkEvents.filter(e => e.targetId === req.params.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return res.json(ok(list));
});
app.get("/api/targets/:id/anomalies", (req, res) => {
  return res.json(ok(anomalies.filter(a => a.targetId === req.params.id)));
});
app.get("/api/targets/:id/evidence", (req, res) => {
  const t = targets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json(err("NOT_FOUND", "Target not found"));
  return res.json(ok(evidence.filter(e => e.caseId === t.caseId)));
});

// --- devices -----------------------------------------------------------------
app.get("/api/devices/:imei", (req, res) => {
  const d = devices.find(x => x.imei === req.params.imei || x.imei2 === req.params.imei);
  if (!d) return res.status(404).json(err("NOT_FOUND", "Device not found"));
  return res.json(ok(d));
});

// --- identity ----------------------------------------------------------------
app.get("/api/identity/:targetId", (req, res) => {
  const t = targets.find(x => x.id === req.params.targetId);
  if (!t) return res.status(404).json(err("NOT_FOUND", "Target not found"));
  const d = devices.find(x => x.id === t.deviceId) ?? devices[0];
  const related = targets.filter(o => o.id !== t.id && (o.imei === t.imei || o.imei2 === t.imei2 || o.iccid === t.iccid));
  return res.json(ok({ target: t, device: d, relatedTargets: related }));
});

// --- cells -------------------------------------------------------------------
app.get("/api/cells", (_req, res) => res.json(ok(cells)));
app.get("/api/cells/:id", (req, res) => {
  const c = cells.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json(err("NOT_FOUND", "Cell not found"));
  const assocEvents = networkEvents.filter(e => e.cellId === c.id);
  return res.json(ok({ cell: c, events: assocEvents }));
});

// --- audit -------------------------------------------------------------------
app.get("/api/audit", (_req, res) => res.json(ok(auditEvents)));
app.get("/api/audit/:id", (req, res) => {
  const e = auditEvents.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json(err("NOT_FOUND", "Audit event not found"));
  return res.json(ok(e));
});
const emitSchema = z.object({
  action: z.string().min(1).max(80),
  caseId: z.string().min(1).max(40).optional(),
  query: z.string().max(120).optional(),
  dataSource: z.string().max(80).optional(),
  authorization: z.string().max(80).optional(),
  result: z.enum(["success","denied","error"]).default("success")
});

app.post("/api/audit/emit", (req, res) => {
  const parsed = emitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(err("BAD_REQUEST", "Invalid audit payload"));
  const e: AuditEvent = {
    id: `AUD-${String(++auditSeq).padStart(5, "0")}`,
    timestamp: new Date().toISOString(),
    user: "A-102",
    caseId: parsed.data.caseId ?? "CASE-2026-9941A",
    action: parsed.data.action,
    query: parsed.data.query ?? "—",
    dataSource: parsed.data.dataSource ?? "Client Action",
    authorization: parsed.data.authorization ?? "AUTH-DEMO-2026-0041",
    result: parsed.data.result
  };
  auditEvents.unshift(e);
  return res.status(201).json(ok(e));
});

// --- admin -------------------------------------------------------------------
app.get("/api/admin/users", (_req, res) => res.json(ok(users.map(u => ({ ...u, roleName: roles.find(r => r.id === u.role)?.name ?? u.role })))));
app.get("/api/admin/roles", (_req, res) => res.json(ok(roles)));
app.get("/api/admin/integrations", async (_req, res) => {
  const withHealth = await Promise.all(integrations.map(async i => ({ ...i, ...(await adapters[i.id.replace("int-", "") as keyof typeof adapters].health()) })));
  return res.json(ok(withHealth));
});
app.get("/api/admin/compliance", (_req, res) => res.json(ok({ cases: cases.map(c => ({ id: c.id, authorization: c.authorization, validFrom: c.validFrom, validUntil: c.validUntil, investigator: c.investigator })), audit: auditEvents, evidence })));

// --- global search -----------------------------------------------------------
app.get("/api/search", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (!q) return res.json(ok({ cases: [], targets: [], devices: [], events: [], audit: [] }));
  const match = (s: string) => s.toLowerCase().includes(q);
  return res.json(ok({
    cases: cases.filter(c => match(c.id) || match(c.title)).slice(0, 5),
    targets: targets.filter(t => match(t.id) || match(t.imei) || match(t.imei2) || match(t.msisdn)).slice(0, 5),
    devices: devices.filter(d => match(d.imei) || match(d.imei2) || match(d.model)).slice(0, 5),
    events: networkEvents.filter(e => match(e.id) || match(e.cellId)).slice(0, 8),
    audit: auditEvents.filter(a => match(a.action) || match(a.id)).slice(0, 5)
  }));
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => log.info({ port: PORT }, "IMEI TRIANGULATOR demo API listening"));