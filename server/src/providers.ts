// Provider adapter shell. In production, legitimate authorized adapters would
// implement this interface. In this demo every adapter returns synthetic data.

import type { NetworkEvent, Cell } from "./data.js";

export interface ProviderAdapter {
  readonly id: string;
  readonly name: string;
  health(): Promise<{ status: "operational" | "degraded" | "offline"; lastSync: string }>;
  eventsForTarget(targetId: string, events: NetworkEvent[]): Promise<NetworkEvent[]>;
  cells(cells: Cell[]): Promise<Cell[]>;
}

class DemoAdapter implements ProviderAdapter {
  readonly id: string;
  readonly name: string;
  private syntheticStatus: "operational" | "degraded" | "offline";

  constructor(id: string, name: string, syntheticStatus: "operational" | "degraded" | "offline" = "operational") {
    this.id = id;
    this.name = name;
    this.syntheticStatus = syntheticStatus;
  }

  async health() {
    return { status: this.syntheticStatus, lastSync: new Date().toISOString() };
  }

  async eventsForTarget(targetId: string, events: NetworkEvent[]) {
    return events.filter(e => e.targetId === targetId && e.provider === this.name);
  }

  async cells(cells: Cell[]) {
    return cells.filter(c => c.provider === this.name);
  }
}

export const adapters: Record<string, ProviderAdapter> = {
  mtn:   new DemoAdapter("int-mtn", "Demo MTN Adapter"),
  air:   new DemoAdapter("int-air", "Demo Airtel Adapter"),
  glo:   new DemoAdapter("int-glo", "Demo Glo Adapter", "degraded"),
  "9mb": new DemoAdapter("int-9mb", "Demo 9mobile Adapter"),
  gov:   new DemoAdapter("int-gov", "Demo Government System")
};