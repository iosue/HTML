// -----------------------------
// TRACK SECTION
// -----------------------------
export class TrackSection {
    constructor(id, startX=0, startY=0, heading=0, length=0) {
        this.id = id;
        this.length = length;
        this.next = [];

        this.start = { x: startX, y: startY };
        this.heading = heading;
        this.recomputeGeometry();
    }

    recomputeGeometry() {
        this.end = {
            x: this.start.x + this.length * Math.cos(this.heading),
            y: this.start.y + this.length * Math.sin(this.heading)
        };
    }

    setStartAndHeading(start, heading) {
        this.start = { x: start.x, y: start.y };
        this.heading = heading;
        this.recomputeGeometry();
    }

    getEndHeading() {
        return this.heading;
    }

    addNext(section) {
        this.next.push(section);
    }

    getPointAt(t) {
        return {
            x: this.start.x + (this.end.x - this.start.x) * t,
            y: this.start.y + (this.end.y - this.start.y) * t
        };
    }
    draw(ctx) {
        if (this.isDisconnected) {
            ctx.strokeStyle = "red";
        } else if (this.isActiveBranch === false) {
            ctx.strokeStyle = "#444";
            ctx.globalAlpha = 0.4; // semi-transparent inactive
        } else {
            ctx.strokeStyle = "#444";
            ctx.globalAlpha = 1.0;
        }

        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

// -----------------------------
// CURVED SECTION
// -----------------------------
export class CurvedTrackSection extends TrackSection {
    constructor(id, startX, startY, heading, radius, sweepAngle) {
        super(id, startX, startY, heading, radius * Math.abs(sweepAngle));
        this.radius = radius;
        this.sweepAngle = sweepAngle;
        this.recomputeGeometry();
    }

    recomputeGeometry() {
        const { x: startX, y: startY } = this.start;
        const heading = this.heading;
        const radius = this.radius;
        const sweepAngle = this.sweepAngle;

        const normalAngle = heading + (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2);
        this.center = {
            x: startX + radius * Math.cos(normalAngle),
            y: startY + radius * Math.sin(normalAngle)
        };

        this.startAngle = heading - (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2);
        this.endAngle = this.startAngle + sweepAngle;

        this.end = {
            x: this.center.x + radius * Math.cos(this.endAngle),
            y: this.center.y + radius * Math.sin(this.endAngle)
        };

        this.length = radius * Math.abs(sweepAngle);
    }

    setStartAndHeading(start, heading) {
        this.start = { x: start.x, y: start.y };
        this.heading = heading;
        this.recomputeGeometry();
    }

    getEndHeading() {
        return this.heading + this.sweepAngle;
    }

    getPointAt(t) {
        const angle = this.startAngle + this.sweepAngle * t;
        return {
            x: this.center.x + this.radius * Math.cos(angle),
            y: this.center.y + this.radius * Math.sin(angle)
        };
    }

draw(ctx) {
    if (this.isDisconnected) {
        ctx.strokeStyle = "red";
    } else if (this.isActiveBranch === false) {
        ctx.strokeStyle = "#444";
        ctx.globalAlpha = 0.4;
    } else {
        ctx.strokeStyle = "#444";
        ctx.globalAlpha = 1.0;
    }

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
        this.center.x,
        this.center.y,
        this.radius,
        this.startAngle,
        this.endAngle,
        this.sweepAngle < 0
    );
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}
}


// -----------------------------
// SWITCH SECTION
// -----------------------------
export class SwitchSection extends TrackSection {
    constructor(id, x1, y1, x2, y2) {
        super(id, x1, y1, x2, y2);
        this.activeIndex = 0; // which exit is active
    }

    setRoute(index) {
        if (index >= 0 && index < this.next.length) {
            this.activeIndex = index;
        }
    }

    getActiveNext() {
        return this.next[this.activeIndex];
    }

    draw(ctx) {
        super.draw(ctx);
        // highlight switch
        const p = this.getPointAt(0.5);
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// -----------------------------
// TRAIN
// -----------------------------
export class Train {
    constructor(id, track, speed = 40) {
        this.id = id;
        this.track = track; // TrackSection
        this.t = 0;         // position along track (0..1)
        this.speed = speed; // px per second
    }

    update(dt) {
      const dist = this.speed * dt;
      const deltaT = dist / this.track.length;
        this.t += deltaT;

        if (this.t >= 1) {
            this.t = 0;

            // choose next track
            if (this.track instanceof SwitchSection) {
                this.track = this.track.getActiveNext();
            } else {
                this.track = this.track.next[0];
            }
        }
    }

    draw(ctx) {
        const p = this.track.getPointAt(this.t);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// -----------------------------
// TRACK NETWORK
// -----------------------------
export class TrackNetwork {
    constructor() {
        this.sections = [];
        this.trains = [];
    }

    addSection(section) {
        this.sections.push(section);
        return section;
    }
    connectSections(prev, next) {
        const isSwitch = prev instanceof SwitchSection;
        const alreadyConnected = prev.next.includes(next);

        // Propagate geometry
        const newStart = prev.end;
        const newHeading = prev.getEndHeading();
        next.setStartAndHeading(newStart, newHeading);

        // Connection logic
        if (!isSwitch) {
            prev.next = [next];
        } else if (!alreadyConnected) {
            prev.next.push(next);
        }

        // Mark section as active
        next.isDisconnected = false;
    }

    disconnectSections(prev, next) {
        const index = prev.next.indexOf(next);
        if (index !== -1) {
            prev.next.splice(index, 1);
            next.isDisconnected = true; // mark visually inactive
        }
    }

    markInactiveBranches() {
        // For each switch, mark non-active branches as inactive
        for (const s of this.sections) {
            if (s instanceof SwitchSection) {
                s.next.forEach((branch, i) => {
                    branch.isActiveBranch = i === s.activeIndex;
                });
            }
        }
    }

    addTrain(train) {
        this.trains.push(train);
    }

    update(dt) {
        for (const train of this.trains) train.update(dt);
    }

    draw(ctx) {
        for (const s of this.sections) {
            ctx.globalAlpha = s.fadeAlpha ?? 1;
            s.draw(ctx);
        }
        ctx.globalAlpha = 1;
        for (const t of this.trains) t.draw(ctx);
    }
}
