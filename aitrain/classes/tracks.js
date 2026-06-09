// -----------------------------
// STRAIGHT SECTION
// -----------------------------
export class TrackSection {
	constructor(id, startX = 0, startY = 0, heading = 0, length = 100, network, color="#444") {
		this.id = id
		this.length = length
		this.next = []

		this.start = { x: startX, y: startY }
		this.heading = heading
		this.color = color
		this.recomputeGeometry()
	}

	recomputeGeometry() {
		this.end = {
			x: this.start.x + this.length * Math.cos(this.heading),
			y: this.start.y + this.length * Math.sin(this.heading),
		}
	}

	setStartAndHeading(start, heading) {
		this.start = { x: start.x, y: start.y }
		this.heading = heading
		this.recomputeGeometry()
	}

	getEndHeading() {
		return this.heading
	}

	addNext(section) {
		this.next.push(section)
	}

	getPointAt(t) {
		return {
			x: this.start.x + (this.end.x - this.start.x) * t,
			y: this.start.y + (this.end.y - this.start.y) * t,
		}
	}
	draw(ctx) {
		if (this.isDisconnected) {
			ctx.strokeStyle = "red"
		} else if (this.isActiveBranch === false) {
			ctx.strokeStyle = "#4444"
		} else {
			ctx.strokeStyle = this.color
		}

		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.moveTo(this.start.x, this.start.y)
		ctx.lineTo(this.end.x, this.end.y)
		ctx.stroke()
		ctx.globalAlpha = 1.0
	}
}

// -----------------------------
// CURVED SECTION
// -----------------------------
export class CurvedTrackSection extends TrackSection {
	constructor(id, startX, startY, heading, radius, sweepAngle, color) {
		super(id, startX, startY, heading, radius * Math.abs(sweepAngle), color)
		this.radius = radius
		this.sweepAngle = sweepAngle
		this.recomputeGeometry()
	}

	recomputeGeometry() {
		const { x: startX, y: startY } = this.start
		const heading = this.heading
		const radius = this.radius
		const sweepAngle = this.sweepAngle

		const normalAngle = heading + (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
		this.center = {
			x: startX + radius * Math.cos(normalAngle),
			y: startY + radius * Math.sin(normalAngle),
		}

		this.startAngle = heading - (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
		this.endAngle = this.startAngle + sweepAngle

		this.end = {
			x: this.center.x + radius * Math.cos(this.endAngle),
			y: this.center.y + radius * Math.sin(this.endAngle),
		}

		this.length = radius * Math.abs(sweepAngle)
	}

	setStartAndHeading(start, heading) {
		this.start = { x: start.x, y: start.y }
		this.heading = heading
		this.recomputeGeometry()
	}

	getEndHeading() {
		return this.heading + this.sweepAngle
	}

	getPointAt(t) {
		const angle = this.startAngle + this.sweepAngle * t
		return {
			x: this.center.x + this.radius * Math.cos(angle),
			y: this.center.y + this.radius * Math.sin(angle),
		}
	}

	draw(ctx) {
		if (this.isDisconnected) {
			ctx.strokeStyle = "red"
		} else if (this.isActiveBranch === false) {
			ctx.strokeStyle = "#4444"
		} else {
			ctx.strokeStyle = this.color
		}

		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.arc(
			this.center.x,
			this.center.y,
			this.radius,
			this.startAngle,
			this.endAngle,
			this.sweepAngle < 0,
		)
		ctx.stroke()
	}
}

// -----------------------------
// SWITCH SECTION
// -----------------------------
export class SwitchSection extends TrackSection {
	constructor(id, startX, startY, heading, length = 0, network = null) {
		super(id, startX, startY, heading, length)
		this.activeIndex = 0
		this.network = network
	}

	setRoute(index) {
		this.activeIndex = index
		this.next.forEach((branch, i) => {
			branch.isActiveBranch = i === index
		})
	}

	cycleRoute() {
		if (!this.network) return

		const occupied =
			this.network.isSectionOccupied(this) ||
			this.next.some(n => this.network.isSectionOccupied(n))

		if (occupied) {
			console.log(`Switch ${this.id} blocked: train present.`)
			return // do nothing
		}

		if (this.next.length === 0) return
		this.activeIndex = (this.activeIndex + 1) % this.next.length
		this.setRoute(this.activeIndex)
	}

	getActiveNext() {
		return this.next[this.activeIndex]
	}

	draw(ctx) {
		const occupied =
			this.network.isSectionOccupied(this) ||
			this.next.some(n => this.network.isSectionOccupied(n))

		ctx.strokeStyle = "#444"
		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.moveTo(this.start.x, this.start.y)
		ctx.lineTo(this.end.x, this.end.y)
		ctx.stroke()

		ctx.beginPath()
		ctx.arc(this.end.x, this.end.y, 6, 0, 2 * Math.PI)
		if (occupied) {
			ctx.strokeStyle = "red"
			ctx.stroke()
		}
		ctx.fillStyle = occupied ? "white" : this.isHovered ? "yellow" : "orange"
		ctx.fill()

		ctx.fillStyle = "#ccc"
		ctx.font = "12px sans-serif"
		ctx.fillText(`Route ${this.activeIndex}`, this.end.x + 10, this.end.y - 10)
	}
}
