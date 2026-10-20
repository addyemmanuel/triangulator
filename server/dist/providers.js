// Provider adapter shell. In production, legitimate authorized adapters would
// implement this interface. In this demo every adapter returns synthetic data.
class DemoAdapter {
    id;
    name;
    syntheticStatus;
    constructor(id, name, syntheticStatus = "operational") {
        this.id = id;
        this.name = name;
        this.syntheticStatus = syntheticStatus;
    }
    async health() {
        return { status: this.syntheticStatus, lastSync: new Date().toISOString() };
    }
    async eventsForTarget(targetId, events) {
        return events.filter(e => e.targetId === targetId && e.provider === this.name);
    }
    async cells(cells) {
        return cells.filter(c => c.provider === this.name);
    }
}
export const adapters = {
    mtn: new DemoAdapter("int-mtn", "Demo MTN Adapter"),
    air: new DemoAdapter("int-air", "Demo Airtel Adapter"),
    glo: new DemoAdapter("int-glo", "Demo Glo Adapter", "degraded"),
    "9mb": new DemoAdapter("int-9mb", "Demo 9mobile Adapter"),
    gov: new DemoAdapter("int-gov", "Demo Government System")
};
