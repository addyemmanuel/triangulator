const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store"
  });
  const body = await res.json();
  if (!res.ok || body.ok === false) throw Object.assign(new Error(body?.error?.message ?? "Request failed"), { code: body?.error?.code, status: res.status });
  return body.data as T;
}

export const api = {
  login: (b: { authorizationId: string; password: string; caseRef: string }) => request<{ stage: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  mfa: (b: { code: string }) => request<{ session: any }>("/api/auth/mfa", { method: "POST", body: JSON.stringify(b) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  cases: () => request<any[]>("/api/cases"),
  case: (id: string) => request<any>(`/api/cases/${id}`),
  caseTargets: (id: string) => request<any[]>(`/api/cases/${id}/targets`),

  target: (id: string) => request<any>(`/api/targets/${id}`),
  targetDevices: (id: string) => request<any[]>(`/api/targets/${id}/devices`),
  targetEvents: (id: string) => request<any[]>(`/api/targets/${id}/events`),
  targetTimeline: (id: string) => request<any[]>(`/api/targets/${id}/timeline`),
  targetAnomalies: (id: string) => request<any[]>(`/api/targets/${id}/anomalies`),
  targetEvidence: (id: string) => request<any[]>(`/api/targets/${id}/evidence`),

  device: (imei: string) => request<any>(`/api/devices/${imei}`),
  identity: (targetId: string) => request<any>(`/api/identity/${targetId}`),

  cells: () => request<any[]>("/api/cells"),
  cell: (id: string) => request<any>(`/api/cells/${id}`),

  audit: () => request<any[]>("/api/audit"),
  auditOne: (id: string) => request<any>(`/api/audit/${id}`),

  adminUsers: () => request<any[]>("/api/admin/users"),
  adminRoles: () => request<any[]>("/api/admin/roles"),
  adminIntegrations: () => request<any[]>("/api/admin/integrations"),
  adminCompliance: () => request<any>("/api/admin/compliance"),

  search: (q: string) => request<any>(`/api/search?q=${encodeURIComponent(q)}`)
};

emitAudit: (b: {
  action: string; caseId?: string; query?: string;
  dataSource?: string; authorization?: string;
  result?: "success"|"denied"|"error";
}) => request<any>("/api/audit/emit", { method: "POST", body: JSON.stringify(b) })