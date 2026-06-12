// -----------------------------
// STRAIGHT SECTION
// -----------------------------
export class TrackSection {
	constructor(id, startX=0, startY=0, heading=0, length=100, network, color="#444" ) {
		this.id = id
		this.length = length
		this.next = []
		this.prev = []

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

	recomputeGeometryBy(endPoint) {
		if (endPoint === "start") {
			this.end = {
				x: this.start.x + this.length * Math.cos(this.heading),
				y: this.start.y + this.length * Math.sin(this.heading),
			}
			return
		}
		if (endPoint === "end") {
			this.start = {
				x: this.end.x - this.length * Math.cos(this.heading),
				y: this.end.y - this.length * Math.sin(this.heading),
			}
			return
		}
		throw new Error("No endpoint provided")
	}

	setStartAndHeading(start, heading) {
		this.start = { x: start.x, y: start.y }
		this.heading = heading
		this.recomputeGeometry()
	}

	setEndPointAndHeading(endPoint="start", point, heading) {
		this[endPoint] = { x: point.x, y: point.y }
		this.heading = {start:heading, end:(heading+Math.PI)%(Math.PI*2)}[endPoint]
		this.recomputeGeometryBy(endPoint)
	}

	getStartHeading() {
		return this.heading
	}

	getEndHeading() {
		return this.heading
	}

	getHeadingAtEnd(endPoint) {
		// Returns tangent angle depending on which end is used
		if (endPoint === "start") return this.getStartHeading()
		if (endPoint === "end") return this.getEndHeading()
		throw new Error("Invalid endpoint reference")
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

getTangentAngleAtWorldPosition(point) {
  // Default for straight sections
  const dx = this.end.x - this.start.x
  const dy = this.end.y - this.start.y
  return Math.atan2(dy, dx)
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

	setEndPointAndHeading(endPoint, point, heading) {
		this[endPoint] = { x: point.x, y: point.y }
		this.heading = {start:heading, end:(heading-this.sweepAngle+Math.PI)%(Math.PI*2)}[endPoint]
		this.recomputeGeometryBy(endPoint)
	}

	recomputeGeometryBy(endPoint) {
		if (endPoint === "start") {
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
			return
		}
		if (endPoint === "end") {
			const { x: endX, y: endY } = this.end
			const heading = this.heading
			const radius = this.radius
			const sweepAngle = this.sweepAngle
			
			const normalAngle = heading + (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
			
				console.log(
					heading*180/Math.PI,
					sweepAngle*180/Math.PI,
					normalAngle*180/Math.PI
				)
			
			this.center = {
				x: endX + radius * Math.cos(normalAngle),
				y: endY + radius * Math.sin(normalAngle),
			}
			
			this.startAngle = heading - (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
			this.endAngle = this.startAngle + sweepAngle
			
			this.start = {
				x: this.center.x + radius * Math.cos(this.endAngle),
				y: this.center.y + radius * Math.sin(this.endAngle),
			}
			
			this.length = radius * Math.abs(sweepAngle)
			return
		}
		throw new Error("No endpoint provided; curve")
	}


	setStartAndHeading(start, heading) {
		this.start = { x: start.x, y: start.y }
		this.heading = heading
		this.recomputeGeometry()
	}


	getStartHeading() {
		return this.heading
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

getTangentAngleAtWorldPosition(point) {
  // Vector from center to bogie position
  const vx = point.x - this.center.x
  const vy = point.y - this.center.y
  const radialAngle = Math.atan2(vy, vx)

  // Tangent is perpendicular to radius vector
  return radialAngle + (this.clockwise ? Math.PI / 2 : -Math.PI / 2)
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

		ctx.beginPath()
		ctx.arc(
			this.start.x,
			this.start.y,
			6,
			0,
			Math.PI*2
		)
		ctx.fillStyle="ORANGE"
		ctx.fill()
		ctx.fillText('start',this.start.x,this.start.y)

		ctx.beginPath()
		ctx.arc(
			this.center.x,
			this.center.y,
			6,
			0,
			Math.PI*2
		)
		ctx.fillStyle="CYAN"
		ctx.fill()
		ctx.fillText('center',this.center.x,this.center.y)

		ctx.beginPath()
		ctx.arc(
			this.end.x,
			this.end.y,
			6,
			0,
			Math.PI*2
		)
		ctx.fillStyle="PURPLE"
		ctx.fill()
		ctx.fillText('end',this.end.x,this.end.y)
	}
}


// -----------------------------
// SWITCH SECTION
// -----------------------------
export class SwitchSection extends TrackSection {
	constructor(id, startX, startY, heading, length = 10, network = null) {
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

// -----------------------------
// NEW STRAIGHT
// -----------------------------
export class NewStraight {
	constructor(network,id=new UUID(),x=0,y=0,a=0,l=100,color="#444") {
		this.network=network
		this.id=id
		this.A={x,y,a}
		this.length=l
		this.color=color
		this.prev=[]
		this.next=[]
	}
	setA(point) {
		this.A=point
	}
	setB(point) {

	}
	get B() {
		return {
			x:this.A.x+this.length*Math.cos(this.A.a),
			y:this.A.y+this.length*Math.sin(this.A.a),
			a:this.A.a
		}
	}
	getNormalAt(point) {
		return normalizeAngle(this.A.a + Math.PI/2)
	}
	getTangentAt(point) {
		const dx = this.B.x-this.A.x,
					dy = this.B.y-this.A.y 
		return Math.atan2(dy,dx)
	}
	getPointAt(t/*=(0..1)*/) { 

	}

	draw(ctx) {
		ctx.save()
			if (this.isDisconnected) ctx.strokeStyle = "red"
			else if (this.isActiveBranch === false) ctx.strokeStyle = "#4444"
			else ctx.strokeStyle = this.color
			ctx.lineWidth = 4
			ctx.beginPath()
			ctx.moveTo(this.A.x, this.A.y)
			ctx.lineTo(this.B.x, this.B.y)
			ctx.stroke()
		ctx.restore()
	}
}


// -----------------------------
// NEW CURVE
// -----------------------------
export class NewCurve extends NewStraight {
	constructor(network,id=new UUID(),x=0,y=0,a=0,r=100,s=Math.PI/6,cw=true,color="#345") {
		super(network,id,x,y,a,undefined,color)
		this.radius=r
		this.sweep=s
		this.clockwise=cw
	}
	setA(point) {
		console.log('setting',this.id,'A:',point)
		return this.A=point
	}
	setB(point) {
		console.log('setting',this.id,'B:',point)
		if (confirm(`override position based on Endpoint=${point}?`)) {

		}
		return this.B
	}
	getNormalAt(point) {
		// Vector from center to bogie position
		const vx = point.x - this.O.x
		const vy = point.y - this.O.y
		const radialAngle = Math.atan2(vy, vx)
		return normalizeAngle(
			radialAngle
		)
	}
	getTangentAt(point) {
		return normalizeAngle(
			this.getNormalAt(point) + (this.clockwise ? Math.PI / 2 : -Math.PI / 2)
		)
	}
	getPointAt(t/*=(0..1)*/) { 

	}
	get O() {
		const radialAngle = normalizeAngle(
			this.A.a + (this.clockwise ? Math.PI/2 : -Math.PI/2)
		)
		return {
			x: this.A.x + this.radius * Math.cos(radialAngle),
			y: this.A.y + this.radius * Math.sin(radialAngle),
			a: radialAngle
		}
	}
	get B() {
		const a = this.A.a + this.sweep*(this.clockwise?1:-1)
		return {
			x:this.O.x + this.radius * Math.cos(Math.PI/2-a) * (this.clockwise?1:-1),
			y:this.O.y - this.radius * Math.sin(Math.PI/2-a) * (this.clockwise?1:-1),
			a
		}
	}

	draw(ctx) {
		ctx.save()

			ctx.beginPath()
			ctx.arc(
				this.O.x, this.O.y, 
				this.radius, 
				this.getNormalAt(this.A), 
				this.getNormalAt(this.B),
				!this.clockwise
			)

			ctx.strokeStyle = this.color
			ctx.lineWidth = 4
			ctx.stroke()
			
			ctx.globalAlpha=0.4
			ctx.lineWidth = 1

			ctx.beginPath()
			ctx.fillStyle=this.color
			ctx.strokeStyle=this.color
			ctx.arc(this.O.x, this.O.y, 4, 0, Math.PI*2)
			ctx.fill()
			ctx.moveTo(this.O.x, this.O.y)
			ctx.lineTo(this.O.x + 20*Math.cos(this.O.a), this.O.y + 20*Math.sin(this.O.a))
			ctx.stroke()

			
			ctx.beginPath()
			ctx.fillStyle="yellow"
			ctx.strokeStyle="yellow"
			ctx.arc(this.A.x, this.A.y, 4, 0, Math.PI*2)
			ctx.fill()
			ctx.moveTo(this.A.x, this.A.y)
			ctx.lineTo(this.A.x + 20*Math.cos(this.A.a), this.A.y + 20*Math.sin(this.A.a))
			ctx.stroke()
			
			ctx.lineWidth = 8

			ctx.beginPath()
			ctx.fillStyle="red"
			ctx.strokeStyle="red"
			ctx.arc(this.B.x, this.B.y, 4, 0, Math.PI*2)
			ctx.fill()
			ctx.beginPath()
			ctx.moveTo(this.B.x, this.B.y)
			ctx.lineTo(this.B.x + 10*Math.cos(this.B.a), this.B.y + 10*Math.sin(this.B.a))
			ctx.stroke()

		ctx.restore()
	}
}


function normalizeAngle(a) {
	while (a < 0) a += Math.PI*2
	return a % (Math.PI*2)
}
