// SYNTHETIC DEMO DATA ONLY.
// No real IMEIs, MSISDNs, ICCIDs, subscribers, carriers or coordinates.
// Every value here is fabricated for the IMEI TRIANGULATOR prototype.

// ------------------------------------------------------------------ TYPES

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export type User = {
  id: string;
  badge: string;
  name: string;
  role: string;
  status: "active" | "suspended" | "invited";
  lastAccess: string;
  mfa: boolean;
};

export type CaseStatus = "active" | "pending_review" | "archived";

export type Case = {
  id: string;
  title: string;
  purpose: string;
  priority: "low" | "medium" | "high";
  status: CaseStatus;
  investigator: string;
  authorization: string;
  authorizationType: string;
  validFrom: string;
  validUntil: string;
  targetIds: string[];
  createdAt: string;
  updatedAt: string;
  lastEventAt: string;
  closedAt?: string;
  evidenceStatus?: string;
  archiveStatus?: string;
};

export type Target = {
  id: string;
  caseId: string;
  label: string;
  notes: string;
  imei: string;
  imei2: string;
  msisdn: string;
  iccid: string;
  subscriber: string;
  deviceId: string;
  status: "active" | "monitoring" | "closed";
  lastEventAt: string;
};

export type AssociatedSim = {
  iccid: string;
  msisdn: string;
  firstSeen: string;
};

export type PreviousDevice = {
  imei: string;
  model: string;
  lastSeen: string;
};

export type Validation = {
  key: string;
  label: string;
  state: "ok" | "warn" | "fail";
  note?: string;
};

export type Device = {
  id: string;
  imei: string;
  imei2: string;
  tac: string;
  manufacturer: string;
  model: string;
  status: "in_service" | "restricted" | "blocked";
  associatedSims: AssociatedSim[];
  previousDevices: PreviousDevice[];
  validation: Validation[];
};

export type Sector = {
  id: string;
  azimuth: number;
  range: number;
  band: string;
};

export type Cell = {
  id: string;
  name: string;
  provider: string;
  lat: number;
  lng: number;
  sectors: Sector[];
  coverage: string;
  historicalAssociations: number;
  confidence: "low" | "medium" | "high";
};

export type NetworkEvent = {
  id: string;
  timestamp: string;
  type: string;
  imei: string;
  imei2: string;
  msisdn: string;
  cellId: string;
  sector: string;
  provider: string;
  confidence: "low" | "medium" | "high";
  source: string;
  caseId: string;
  targetId: string;
};

export type Anomaly = {
  id: string;
  targetId: string;
  caseId: string;
  indicator: string;
  severity: "low" | "medium" | "high";
  description: string;
  evidence: string;
  firstDetected: string;
  lastDetected: string;
  status: "open" | "reviewing" | "closed";
};

export type ChainStage = {
  stage: string;
  at: string;
  by: string;
};

export type Evidence = {
  id: string;
  caseId: string;
  type: string;
  description: string;
  addedBy: string;
  timestamp: string;
  verification: "unverified" | "reviewed" | "verified";
  hash: string;
  chain: ChainStage[];
};

export type AuditResult = "success" | "denied" | "error";

export type AuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  caseId: string;
  action: string;
  query: string;
  dataSource: string;
  authorization: string;
  result: AuditResult;
};

export type Integration = {
  id: string;
  provider: string;
  status: "operational" | "degraded" | "offline";
  lastSync: string;
  requests: number;
  errors: number;
  auth: string;
};

// ------------------------------------------------------------------ ROLES

export const roles: Role[] = [
  {
    id: "inv",
    name: "INVESTIGATOR",
    description: "Runs cases, queries targets, submits evidence.",
    permissions: [
      "cases.read", "cases.write", "intelligence.read",
      "network.read", "evidence.write", "audit.read"
    ]
  },
  {
    id: "cm",
    name: "CASE MANAGER",
    description: "Assigns investigators, approves authorizations.",
    permissions: [
      "cases.read", "cases.write", "cases.assign",
      "intelligence.read", "network.read", "evidence.read", "audit.read"
    ]
  },
  {
    id: "co",
    name: "COMPLIANCE OFFICER",
    description: "Oversees authorization, audits, evidence integrity.",
    permissions: [
      "cases.read", "evidence.read", "audit.read",
      "compliance.read", "compliance.write"
    ]
  },
  {
    id: "sa",
    name: "SYSTEM ADMINISTRATOR",
    description: "Manages users, roles, integrations.",
    permissions: [
      "admin.users", "admin.roles", "admin.integrations",
      "admin.compliance", "audit.read"
    ]
  }
];

// ------------------------------------------------------------------ USERS

export const users: User[] = [
  { id: "u1", badge: "A-102", name: "A. ADEYEMI", role: "inv", status: "active",    lastAccess: "2026-06-14T14:42:00Z", mfa: true },
  { id: "u2", badge: "A-118", name: "T. BALOGUN", role: "cm",  status: "active",    lastAccess: "2026-06-14T13:20:00Z", mfa: true },
  { id: "u3", badge: "A-134", name: "N. CHUKWU",  role: "inv", status: "active",    lastAccess: "2026-06-14T12:02:00Z", mfa: true },
  { id: "u4", badge: "A-141", name: "S. DANJUMA", role: "co",  status: "active",    lastAccess: "2026-06-13T17:45:00Z", mfa: true },
  { id: "u5", badge: "A-150", name: "K. EZE",     role: "sa",  status: "active",    lastAccess: "2026-06-14T09:10:00Z", mfa: true },
  { id: "u6", badge: "A-161", name: "R. FASHOLA", role: "inv", status: "suspended", lastAccess: "2026-05-30T15:20:00Z", mfa: false }
];

// ------------------------------------------------------------------ CASES

export const cases: Case[] = [
  {
    id: "CASE-2026-9941A",
    title: "Network-assisted location review",
    purpose: "Trace network events for a reported device-fraud cluster across three providers.",
    priority: "high",
    status: "active",
    investigator: "A. ADEYEMI",
    authorization: "AUTH-DEMO-2026-0041",
    authorizationType: "Judicial warrant (demo)",
    validFrom: "2026-06-01T00:00:00Z",
    validUntil: "2026-08-01T00:00:00Z",
    targetIds: ["TARGET-001", "TARGET-002"],
    createdAt: "2026-06-03T08:00:00Z",
    updatedAt: "2026-06-14T14:42:00Z",
    lastEventAt: "2026-06-14T14:32:00Z"
  },
  {
    id: "CASE-2026-9872B",
    title: "Duplicate-IMEI pattern",
    purpose: "Investigate reuse of a device identity across unrelated subscribers.",
    priority: "medium",
    status: "active",
    investigator: "N. CHUKWU",
    authorization: "AUTH-DEMO-2026-0039",
    authorizationType: "Internal authorization (demo)",
    validFrom: "2026-05-20T00:00:00Z",
    validUntil: "2026-07-20T00:00:00Z",
    targetIds: ["TARGET-003", "TARGET-004"],
    createdAt: "2026-05-22T11:15:00Z",
    updatedAt: "2026-06-13T18:10:00Z",
    lastEventAt: "2026-06-13T18:02:00Z"
  },
  {
    id: "CASE-2026-9810C",
    title: "Multi-SIM association review",
    purpose: "Review legitimate multi-SIM behavior flagged by an upstream rule.",
    priority: "low",
    status: "active",
    investigator: "A. ADEYEMI",
    authorization: "AUTH-DEMO-2026-0036",
    authorizationType: "Internal authorization (demo)",
    validFrom: "2026-05-10T00:00:00Z",
    validUntil: "2026-07-10T00:00:00Z",
    targetIds: ["TARGET-005"],
    createdAt: "2026-05-12T09:40:00Z",
    updatedAt: "2026-06-12T10:05:00Z",
    lastEventAt: "2026-06-12T09:58:00Z"
  },
  {
    id: "CASE-2026-9788D",
    title: "Roaming anomaly intake",
    purpose: "Initial intake for cross-border roaming anomaly flagged by demo analytics.",
    priority: "medium",
    status: "pending_review",
    investigator: "A. ADEYEMI",
    authorization: "AUTH-DEMO-2026-0033",
    authorizationType: "Internal authorization (demo)",
    validFrom: "2026-04-30T00:00:00Z",
    validUntil: "2026-06-30T00:00:00Z",
    targetIds: ["TARGET-006"],
    createdAt: "2026-05-01T13:22:00Z",
    updatedAt: "2026-06-10T16:15:00Z",
    lastEventAt: "2026-06-10T16:10:00Z"
  },
  {
    id: "CASE-2025-9501Z",
    title: "Closed: historical device reuse",
    purpose: "Closed review of historical device reuse across a subscriber group.",
    priority: "low",
    status: "archived",
    investigator: "N. CHUKWU",
    authorization: "AUTH-DEMO-2025-0911",
    authorizationType: "Internal authorization (demo)",
    validFrom: "2025-10-01T00:00:00Z",
    validUntil: "2026-01-01T00:00:00Z",
    targetIds: ["TARGET-007", "TARGET-008"],
    createdAt: "2025-10-05T08:30:00Z",
    updatedAt: "2026-01-04T12:00:00Z",
    lastEventAt: "2025-12-22T21:15:00Z",
    closedAt: "2026-01-04T12:00:00Z",
    evidenceStatus: "VERIFIED",
    archiveStatus: "SEALED"
  }
];

// ------------------------------------------------------------------ TARGETS

export const targets: Target[] = [
  {
    id: "TARGET-001", caseId: "CASE-2026-9941A", label: "TARGET-001",
    notes: "Primary subject device. Multi-provider event cluster.",
    imei: "352099781234567", imei2: "352099781234575",
    msisdn: "+234 800 000 1421", iccid: "8923400000000000142",
    subscriber: "S. OKAFOR (demo)", deviceId: "DEV-0001",
    status: "active", lastEventAt: "2026-06-14T14:32:00Z"
  },
  {
    id: "TARGET-002", caseId: "CASE-2026-9941A", label: "TARGET-002",
    notes: "Secondary association identified via IMEI overlap.",
    imei: "352099781234583", imei2: "352099781234591",
    msisdn: "+234 800 000 1877", iccid: "8923400000000001877",
    subscriber: "K. BELLO (demo)", deviceId: "DEV-0002",
    status: "monitoring", lastEventAt: "2026-06-14T11:18:00Z"
  },
  {
    id: "TARGET-003", caseId: "CASE-2026-9872B", label: "TARGET-003",
    notes: "Duplicate IMEI overlap with TARGET-004.",
    imei: "358220991122334", imei2: "358220991122342",
    msisdn: "+234 800 000 2010", iccid: "8923400000000002010",
    subscriber: "M. UMAR (demo)", deviceId: "DEV-0003",
    status: "active", lastEventAt: "2026-06-13T18:02:00Z"
  },
  {
    id: "TARGET-004", caseId: "CASE-2026-9872B", label: "TARGET-004",
    notes: "Duplicate IMEI overlap with TARGET-003.",
    imei: "358220991122334", imei2: "358220991122350",
    msisdn: "+234 800 000 2042", iccid: "8923400000000002042",
    subscriber: "A. YAKUBU (demo)", deviceId: "DEV-0004",
    status: "monitoring", lastEventAt: "2026-06-13T15:44:00Z"
  },
  {
    id: "TARGET-005", caseId: "CASE-2026-9810C", label: "TARGET-005",
    notes: "Multi-SIM subscriber, likely legitimate.",
    imei: "351122334455667", imei2: "351122334455675",
    msisdn: "+234 800 000 3300", iccid: "8923400000000003300",
    subscriber: "C. NWOSU (demo)", deviceId: "DEV-0005",
    status: "monitoring", lastEventAt: "2026-06-12T09:58:00Z"
  },
  {
    id: "TARGET-006", caseId: "CASE-2026-9788D", label: "TARGET-006",
    notes: "Cross-border roaming intake.",
    imei: "353344556677889", imei2: "353344556677897",
    msisdn: "+234 800 000 4110", iccid: "8923400000000004110",
    subscriber: "H. IBRAHIM (demo)", deviceId: "DEV-0006",
    status: "active", lastEventAt: "2026-06-10T16:10:00Z"
  },
  {
    id: "TARGET-007", caseId: "CASE-2025-9501Z", label: "TARGET-007",
    notes: "Closed case target.",
    imei: "359900112233445", imei2: "359900112233453",
    msisdn: "+234 800 000 5501", iccid: "8923400000000005501",
    subscriber: "P. ADE (demo)", deviceId: "DEV-0007", status: "closed",
    lastEventAt: "2025-12-22T21:15:00Z"
  },
  {
    id: "TARGET-008", caseId: "CASE-2025-9501Z", label: "TARGET-008",
    notes: "Closed case target.",
    imei: "359900112233452", imei2: "359900112233460",
    msisdn: "+234 800 000 5508", iccid: "8923400000000005508",
    subscriber: "G. OBIA (demo)", deviceId: "DEV-0008", status: "closed",
    lastEventAt: "2025-12-20T18:30:00Z"
  }
];

// ------------------------------------------------------------------ DEVICES

export const devices: Device[] = [
  {
    id: "DEV-0001",
    imei: "352099781234567", imei2: "352099781234575",
    tac: "35209978", manufacturer: "Samsung", model: "Galaxy S24",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000000142", msisdn: "+234 800 000 1421", firstSeen: "2026-05-02T08:14:00Z" },
      { iccid: "8923400000000000999", msisdn: "+234 800 000 1999", firstSeen: "2026-06-01T12:10:00Z" }
    ],
    previousDevices: [
      { imei: "352099781234400", model: "Samsung Galaxy S22", lastSeen: "2026-04-12T09:00:00Z" }
    ],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "warn", note: "Seen on 2 target records" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0002",
    imei: "352099781234583", imei2: "352099781234591",
    tac: "35209978", manufacturer: "Samsung", model: "Galaxy S23",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000001877", msisdn: "+234 800 000 1877", firstSeen: "2026-05-18T10:00:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0003",
    imei: "358220991122334", imei2: "358220991122342",
    tac: "35822099", manufacturer: "Xiaomi", model: "Redmi Note 13",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000002010", msisdn: "+234 800 000 2010", firstSeen: "2026-05-04T07:40:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "warn", note: "Duplicate IMEI across 2 SIMs" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0004",
    imei: "358220991122334", imei2: "358220991122350",
    tac: "35822099", manufacturer: "Xiaomi", model: "Redmi Note 13",
    status: "restricted",
    associatedSims: [
      { iccid: "8923400000000002042", msisdn: "+234 800 000 2042", firstSeen: "2026-05-05T11:22:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "fail", note: "Shared IMEI with TARGET-003" },
      { key: "restriction", label: "Restriction status", state: "warn", note: "Under review" }
    ]
  },
  {
    id: "DEV-0005",
    imei: "351122334455667", imei2: "351122334455675",
    tac: "35112233", manufacturer: "Tecno", model: "Camon 20",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000003300", msisdn: "+234 800 000 3300", firstSeen: "2025-11-02T08:00:00Z" },
      { iccid: "8923400000000003310", msisdn: "+234 800 000 3310", firstSeen: "2025-11-02T08:05:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0006",
    imei: "353344556677889", imei2: "353344556677897",
    tac: "35334455", manufacturer: "Apple", model: "iPhone 14",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000004110", msisdn: "+234 800 000 4110", firstSeen: "2026-01-15T10:30:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0007",
    imei: "359900112233445", imei2: "359900112233453",
    tac: "35990011", manufacturer: "Oppo", model: "A78",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000005501", msisdn: "+234 800 000 5501", firstSeen: "2024-08-10T09:00:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0008",
    imei: "359900112233452", imei2: "359900112233460",
    tac: "35990011", manufacturer: "Oppo", model: "A78",
    status: "in_service",
    associatedSims: [
      { iccid: "8923400000000005508", msisdn: "+234 800 000 5508", firstSeen: "2024-09-01T09:00:00Z" }
    ],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0009",
    imei: "352099781234600", imei2: "352099781234618",
    tac: "35209978", manufacturer: "Samsung", model: "Galaxy A54",
    status: "in_service",
    associatedSims: [],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  },
  {
    id: "DEV-0010",
    imei: "352099781234626", imei2: "352099781234634",
    tac: "35209978", manufacturer: "Samsung", model: "Galaxy A54",
    status: "in_service",
    associatedSims: [],
    previousDevices: [],
    validation: [
      { key: "format", label: "IMEI format", state: "ok" },
      { key: "tac", label: "TAC identified", state: "ok" },
      { key: "record", label: "Device record found", state: "ok" },
      { key: "dupe", label: "Duplicate indicator", state: "ok" },
      { key: "restriction", label: "Restriction status", state: "ok" }
    ]
  }
];

// ------------------------------------------------------------------ CELLS
// Fictional cell coordinates across a demo Lagos grid. All synthetic.

export const cells: Cell[] = [
  {
    id: "CELL-001", name: "Demo Lekki North", provider: "Demo MTN Adapter",
    lat: 6.4470, lng: 3.4700,
    sectors: [
      { id: "S1", azimuth: 30,  range: 1200, band: "LTE 1800" },
      { id: "S2", azimuth: 150, range: 1200, band: "LTE 1800" },
      { id: "S3", azimuth: 270, range: 1200, band: "LTE 1800" }
    ],
    coverage: "Urban macro", historicalAssociations: 42, confidence: "high"
  },
  {
    id: "CELL-002", name: "Demo Lekki Central", provider: "Demo MTN Adapter",
    lat: 6.4410, lng: 3.4800,
    sectors: [
      { id: "S1", azimuth: 45,  range: 900, band: "LTE 2100" },
      { id: "S2", azimuth: 225, range: 900, band: "LTE 2100" }
    ],
    coverage: "Urban micro", historicalAssociations: 18, confidence: "medium"
  },
  {
    id: "CELL-003", name: "Demo Ikoyi Ridge", provider: "Demo Airtel Adapter",
    lat: 6.4520, lng: 3.4350,
    sectors: [
      { id: "S1", azimuth: 90,  range: 1400, band: "LTE 900" },
      { id: "S2", azimuth: 270, range: 1400, band: "LTE 900" }
    ],
    coverage: "Urban macro", historicalAssociations: 27, confidence: "high"
  },
  {
    id: "CELL-004", name: "Demo Victoria Island", provider: "Demo Airtel Adapter",
    lat: 6.4280, lng: 3.4210,
    sectors: [
      { id: "S1", azimuth: 15,  range: 1100, band: "LTE 1800" },
      { id: "S2", azimuth: 195, range: 1100, band: "LTE 1800" }
    ],
    coverage: "Urban macro", historicalAssociations: 33, confidence: "high"
  },
  {
    id: "CELL-005", name: "Demo Marina South", provider: "Demo Glo Adapter",
    lat: 6.4400, lng: 3.3960,
    sectors: [
      { id: "S1", azimuth: 60,  range: 1300, band: "LTE 1800" },
      { id: "S2", azimuth: 240, range: 1300, band: "LTE 1800" }
    ],
    coverage: "Urban macro", historicalAssociations: 12, confidence: "medium"
  },
  {
    id: "CELL-006", name: "Demo Yaba", provider: "Demo Glo Adapter",
    lat: 6.5090, lng: 3.3780,
    sectors: [
      { id: "S1", azimuth: 120, range: 1000, band: "LTE 2100" },
      { id: "S2", azimuth: 300, range: 1000, band: "LTE 2100" }
    ],
    coverage: "Urban micro", historicalAssociations: 9, confidence: "low"
  },
  {
    id: "CELL-007", name: "Demo Surulere", provider: "Demo 9mobile Adapter",
    lat: 6.5000, lng: 3.3480,
    sectors: [
      { id: "S1", azimuth: 0,   range: 1500, band: "LTE 900" },
      { id: "S2", azimuth: 180, range: 1500, band: "LTE 900" }
    ],
    coverage: "Urban macro", historicalAssociations: 21, confidence: "medium"
  },
  {
    id: "CELL-008", name: "Demo Apapa", provider: "Demo MTN Adapter",
    lat: 6.4470, lng: 3.3590,
    sectors: [
      { id: "S1", azimuth: 90,  range: 1200, band: "LTE 1800" },
      { id: "S2", azimuth: 270, range: 1200, band: "LTE 1800" }
    ],
    coverage: "Urban macro", historicalAssociations: 15, confidence: "medium"
  }
];

// ------------------------------------------------------------------ NETWORK EVENTS
// Built at module load. Deterministic seed so charts stay stable between reloads.

function mulberry32(seed: number): () => number {
  let a = seed;
  return function next(): number {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoAt(baseIso: string, minutesOffset: number): string {
  const t = new Date(baseIso).getTime() + minutesOffset * 60000;
  return new Date(t).toISOString();
}

const eventTypes: string[] = [
  "Location Update", "Attach", "Detach", "Handover", "Paging",
  "SMS-MO", "SMS-MT", "Voice-MO", "Voice-MT", "Data Session"
];

function buildNetworkEvents(): NetworkEvent[] {
  const rnd = mulberry32(9941);
  const providersByCell: Record<string, string> = {};
  for (const c of cells) providersByCell[c.id] = c.provider;

  const out: NetworkEvent[] = [];
  const base = "2026-06-14T09:00:00Z";
  const active = targets.filter(function (t) {
    return t.status === "active" || t.status === "monitoring";
  });

  let seq = 0;
  for (const t of active) {
    const count = t.caseId === "CASE-2026-9941A" ? 22 : 15;
    for (let k = 0; k < count; k++) {
      const cell = cells[Math.floor(rnd() * cells.length)];
      const sector = cell.sectors[Math.floor(rnd() * cell.sectors.length)].id;
      const type = eventTypes[Math.floor(rnd() * eventTypes.length)];
      const r = rnd();
      let conf: NetworkEvent["confidence"] = "low";
      if (r > 0.7) conf = "high";
      else if (r > 0.35) conf = "medium";

      seq += 1;
      out.push({
        id: "EVT-" + String(seq).padStart(5, "0"),
        timestamp: isoAt(base, k * 7 + Math.floor(rnd() * 5)),
        type: type,
        imei: t.imei,
        imei2: t.imei2,
        msisdn: t.msisdn,
        cellId: cell.id,
        sector: sector,
        provider: providersByCell[cell.id],
        confidence: conf,
        source: providersByCell[cell.id],
        caseId: t.caseId,
        targetId: t.id
      });
    }
  }

  out.sort(function (a, b) {
    return a.timestamp.localeCompare(b.timestamp);
  });
  return out;
}

export const networkEvents: NetworkEvent[] = buildNetworkEvents();

// ------------------------------------------------------------------ ANOMALIES

export const anomalies: Anomaly[] = [
  {
    id: "AN-001", targetId: "TARGET-001", caseId: "CASE-2026-9941A",
    indicator: "Multiple SIM Associations Detected", severity: "medium",
    description: "Two ICCIDs observed against the same IMEI within the observation window.",
    evidence: "EVT-00012, EVT-00041",
    firstDetected: "2026-06-08T11:12:00Z",
    lastDetected: "2026-06-14T14:12:00Z",
    status: "open"
  },
  {
    id: "AN-002", targetId: "TARGET-001", caseId: "CASE-2026-9941A",
    indicator: "Multiple Device Associations Detected", severity: "medium",
    description: "Subscriber MSISDN observed against more than one device record.",
    evidence: "DEV-0001, DEV-0009",
    firstDetected: "2026-06-07T08:20:00Z",
    lastDetected: "2026-06-13T20:41:00Z",
    status: "reviewing"
  },
  {
    id: "AN-003", targetId: "TARGET-001", caseId: "CASE-2026-9941A",
    indicator: "IMEI Anomaly Detected", severity: "high",
    description: "IMEI/IMEI2 pairing inconsistent with the TAC-issued range.",
    evidence: "DEV-0001.validation.tac",
    firstDetected: "2026-06-06T13:03:00Z",
    lastDetected: "2026-06-14T14:30:00Z",
    status: "open"
  },
  {
    id: "AN-004", targetId: "TARGET-003", caseId: "CASE-2026-9872B",
    indicator: "Blocked/Restricted Device", severity: "high",
    description: "Shared IMEI observed on a device record under review.",
    evidence: "DEV-0004",
    firstDetected: "2026-05-29T10:15:00Z",
    lastDetected: "2026-06-13T18:00:00Z",
    status: "reviewing"
  },
  {
    id: "AN-005", targetId: "TARGET-005", caseId: "CASE-2026-9810C",
    indicator: "Unusual Network Activity", severity: "low",
    description: "Elevated paging rate outside historical pattern for this subscriber.",
    evidence: "EVT-00062",
    firstDetected: "2026-06-02T17:45:00Z",
    lastDetected: "2026-06-12T09:52:00Z",
    status: "closed"
  },
  {
    id: "AN-006", targetId: "TARGET-006", caseId: "CASE-2026-9788D",
    indicator: "Data Inconsistency Detected", severity: "medium",
    description: "Provider event timestamps differ across adapters beyond expected skew.",
    evidence: "EVT-00088",
    firstDetected: "2026-06-05T04:00:00Z",
    lastDetected: "2026-06-10T16:08:00Z",
    status: "open"
  }
];

// ------------------------------------------------------------------ EVIDENCE

export const evidence: Evidence[] = [
  {
    id: "EVD-0001", caseId: "CASE-2026-9941A", type: "Device profile extract",
    description: "Synthetic device profile snapshot for TARGET-001 primary IMEI.",
    addedBy: "A-102", timestamp: "2026-06-08T09:14:00Z", verification: "verified",
    hash: "demo:3f9c...a112",
    chain: [
      { stage: "CREATED",  at: "2026-06-08T09:14:00Z", by: "A-102" },
      { stage: "COLLECTED", at: "2026-06-08T09:15:00Z", by: "A-102" },
      { stage: "REVIEWED",  at: "2026-06-09T11:02:00Z", by: "A-118" },
      { stage: "VERIFIED",  at: "2026-06-10T14:21:00Z", by: "A-141" }
    ]
  },
  {
    id: "EVD-0002", caseId: "CASE-2026-9941A", type: "Network event bundle",
    description: "22 synthetic network events linked to TARGET-001 across three demo providers.",
    addedBy: "A-102", timestamp: "2026-06-09T10:30:00Z", verification: "reviewed",
    hash: "demo:71ab...0e44",
    chain: [
      { stage: "CREATED",   at: "2026-06-09T10:30:00Z", by: "A-102" },
      { stage: "COLLECTED", at: "2026-06-09T10:31:00Z", by: "A-102" },
      { stage: "REVIEWED",  at: "2026-06-10T09:00:00Z", by: "A-118" }
    ]
  },
  {
    id: "EVD-0003", caseId: "CASE-2026-9941A", type: "Cell-site reference",
    description: "Cell-site reference sheet for 8 synthetic cells in the demo region.",
    addedBy: "A-134", timestamp: "2026-06-11T15:20:00Z", verification: "unverified",
    hash: "demo:c920...5588",
    chain: [
      { stage: "CREATED", at: "2026-06-11T15:20:00Z", by: "A-134" }
    ]
  }
];

// ------------------------------------------------------------------ AUDIT
// Built at module load. Emitted-on-action events are appended by the API.

type AuditSeed = [string, string, string, AuditResult];

function buildAuditEvents(): AuditEvent[] {
  const seeds: AuditSeed[] = [
    ["session.login",            "auth/login",                        "Auth Service",       "success"],
    ["session.mfa_verified",     "auth/mfa",                          "Auth Service",       "success"],
    ["case.opened",              "cases/:id",                         "Case Service",       "success"],
    ["target.viewed",            "targets/:id",                       "Case Service",       "success"],
    ["device.profile_query",     "devices/:imei",                     "Device Service",     "success"],
    ["identity.graph_query",     "identity/:targetId",                "Identity Service",   "success"],
    ["network.events_query",     "targets/:id/events",                "Demo MTN Adapter",   "success"],
    ["network.events_query",     "targets/:id/events",                "Demo Airtel Adapter","success"],
    ["network.events_query",     "targets/:id/events",                "Demo Glo Adapter",   "denied"],
    ["cells.list_query",         "cells",                             "Cell Service",       "success"],
    ["anomalies.list_query",     "targets/:id/anomalies",             "Analytics Service",  "success"],
    ["evidence.added",           "targets/:id/evidence",              "Evidence Service",   "success"],
    ["evidence.report_generated","targets/:id/evidence/report",       "Evidence Service",   "success"],
    ["audit.exported",           "audit/export",                      "Audit Service",      "success"],
    ["admin.user_suspended",     "admin/users/:id",                   "Admin Service",      "success"],
    ["admin.role_updated",       "admin/roles/:id",                   "Admin Service",      "success"],
    ["admin.integration_sync",   "admin/integrations/:id/sync",       "Admin Service",      "error"],
    ["archive.read",             "cases/archive/:id",                 "Case Service",       "success"],
    ["session.locked",           "auth/lock",                         "Auth Service",       "success"],
    ["session.login",            "auth/login",                        "Auth Service",       "denied"]
  ];

  const out: AuditEvent[] = [];
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const dt = new Date(Date.UTC(2026, 5, 14, 8 + i, (i * 7) % 60));
    out.push({
      id: "AUD-" + String(i + 1).padStart(5, "0"),
      timestamp: dt.toISOString(),
      user: users[i % users.length].badge,
      caseId: cases[i % cases.length].id,
      action: s[0],
      query: s[1],
      dataSource: s[2],
      result: s[3],
      authorization: cases[i % cases.length].authorization
    });
  }
  return out;
}

export const auditEvents: AuditEvent[] = buildAuditEvents();

// ------------------------------------------------------------------ INTEGRATIONS

export const integrations: Integration[] = [
  { id: "int-mtn", provider: "Demo MTN Adapter",       status: "operational", lastSync: "2026-06-14T14:40:00Z", requests: 12480, errors: 3,  auth: "mTLS (simulated)" },
  { id: "int-air", provider: "Demo Airtel Adapter",    status: "operational", lastSync: "2026-06-14T14:38:00Z", requests: 9021,  errors: 1,  auth: "OAuth2 (simulated)" },
  { id: "int-glo", provider: "Demo Glo Adapter",       status: "degraded",    lastSync: "2026-06-14T12:02:00Z", requests: 4010,  errors: 22, auth: "API key (simulated)" },
  { id: "int-9mb", provider: "Demo 9mobile Adapter",   status: "operational", lastSync: "2026-06-14T14:30:00Z", requests: 3320,  errors: 0,  auth: "mTLS (simulated)" },
  { id: "int-gov", provider: "Demo Government System", status: "operational", lastSync: "2026-06-14T14:35:00Z", requests: 512,   errors: 0,  auth: "Signed request (simulated)" }
];