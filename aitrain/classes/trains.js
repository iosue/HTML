import { TrackSection, CurvedTrackSection, SwitchSection } from "./tracks.js"
import { TrackNetwork } from "./network.js"

export class Train {
	constructor(
		id,
		track,
		speed = 100,
		network = null,
		carLength = 60,
		overhangRatio = 0.2,
	) {
		this.id = id
		this.track = track
		this.s = 0 // distance from start of current track (center)
		this.speed = 0
		this.forward = true
		this.network = network
		this.carLength = carLength
		this.overhangRatio = overhangRatio // ✅ configurable overhang (10% default)
		this.targetSpeed = 0 // desired speed based on throttle
		this.maxSpeed = speed // maximum speed
		this.accelRate = 25 // units per second²
		this.decelRate = 50 // units per second²
		this.manualControl = true // enable keyboard control
	}

	get frontDist() {
		return this.s + (1 / 2 - this.overhangRatio) * this.carLength
	}
	get rearDist() {
		return this.s - (1 / 2 - this.overhangRatio) * this.carLength
	}

	setGearForward(isForward) {
		this.forward = isForward
	}

	update(dt) {
		if (this.manualControl) {
			if (this.speed < this.targetSpeed)
				this.speed = Math.min(
					this.speed + this.accelRate * dt,
					this.targetSpeed,
				)
			else if (this.speed > this.targetSpeed)
				this.speed = Math.max(
					this.speed - this.decelRate * dt,
					this.targetSpeed,
				)
		}

		const ds = (this.forward ? 1 : -1) * this.speed * dt
		this.s += ds

		if (this.forward) {
			if (this.frontDist > this.track.length) {
				const next =
					this.track instanceof SwitchSection
						? this.track.getActiveNext()
						: this.track.next[0]

				if (next) {
					this.s -= this.track.length
					this.track = next
				} else {
					const overflow = this.frontDist - this.track.length
					this.s -= overflow
					this.forward = false
				}
			}
		} else {
			if (this.rearDist < 0) {
				const prev = this.findPreviousTrack(this.track)
				if (prev) {
					this.track = prev
					this.s += this.track.length
				} else {
					const overflow = -this.rearDist
					this.s += overflow
					this.forward = true
				}
			}
		}
	}

	findPreviousTrack(current) {
		if (!this.network) return null
		for (const section of this.network.sections.values()) {
			if (section.next.includes(current)) return section
		}
		return null
	}

	getPointAlongPath(distanceFromCurrentStart) {
		let current = this.track
		let s = distanceFromCurrentStart

		while (current) {
			if (s < 0) {
				const prev = this.findPreviousTrack(current)
				if (!prev) return current.getPointAt(0)
				s += prev.length
				current = prev
			} else if (s > current.length) {
				const next =
					current instanceof SwitchSection
						? current.getActiveNext()
						: current.next[0]
				if (!next) return current.getPointAt(1)
				s -= current.length
				current = next
			} else {
				return current.getPointAt(s / current.length)
			}
		}

		return this.track.getPointAt(0)
	}

	getSectionAtDistance(distanceFromCurrentStart) {
		let current = this.track
		let s = distanceFromCurrentStart

		while (current) {
			if (s < 0) {
				const prev = this.findPreviousTrack(current)
				if (!prev) return current
				s += prev.length
				current = prev
			} else if (s > current.length) {
				const next =
					current instanceof SwitchSection
						? current.getActiveNext()
						: current.next[0]
				if (!next) return current
				s -= current.length
				current = next
			} else {
				return current
			}
		}

		return this.track
	}

	isOnSection(section) {
		if (this.track === section) return true

		const frontSection = this.getSectionAtDistance(this.frontDist)
		const rearSection = this.getSectionAtDistance(this.rearDist)

		return frontSection === section || rearSection === section
	}

	draw(ctx) {
		const front = this.getPointAlongPath(this.frontDist)
		const rear = this.getPointAlongPath(this.rearDist)

		if (!front || !rear || isNaN(front.x) || isNaN(rear.x)) return

		const dx = front.x - rear.x
		const dy = front.y - rear.y
		const angle = Math.atan2(dy, dx)
		const width = 16

		const cx = (front.x + rear.x) / 2
		const cy = (front.y + rear.y) / 2

		ctx.save()
		ctx.translate(cx, cy)
		ctx.rotate(angle)

    const lights={
      true:"#cc8",
      false:"#800"
    }
    // --- Directional glow setup ---
    const beamLength = 24 // how far the glow extends
    const beamSpread = 8  // beam width
    const glowColorHead = lights[this.forward]
    const glowColorTail = lights[!this.forward]

    // headlights (forward gear)
      const fGrad = ctx.createLinearGradient(
        this.carLength/2, 0,
        this.carLength/2 + beamLength, 0
      )
      fGrad.addColorStop(0, glowColorHead)
      fGrad.addColorStop(1, "transparent")
      ctx.fillStyle = fGrad
      ctx.beginPath()
      ctx.ellipse((1/2)*this.carLength +8+ beamLength/2, 0, beamLength, beamSpread, 0, 0, Math.PI*2)
      ctx.fill()

    // taillights (reverse gear)
      const rGrad = ctx.createLinearGradient(
        -this.carLength/2, 0,
        -this.carLength/2 - beamLength, 0
      )
      rGrad.addColorStop(0, glowColorTail)
      rGrad.addColorStop(1, "transparent")
      ctx.fillStyle = rGrad
      ctx.beginPath()
      ctx.ellipse(-8 - (1/2)*this.carLength - beamLength/2, 0, beamLength, beamSpread, 0, 0, Math.PI*2)
      ctx.fill()

		// body
		ctx.fillStyle = "#666"
		ctx.fillRect(-this.carLength / 2, -width / 2, this.carLength, width)

// --- Bogie rotation lines ---
ctx.strokeStyle = "#999"
ctx.lineWidth = 1.2

// Compute tangent angles at bogie world positions
const frontPoint = this.getPointAlongPath(this.frontDist)
const rearPoint  = this.getPointAlongPath(this.rearDist)
const frontAngle = this.getSectionAtDistance(this.frontDist)
  .getTangentAngleAtWorldPosition(frontPoint)
const rearAngle = this.getSectionAtDistance(this.rearDist)
  .getTangentAngleAtWorldPosition(rearPoint)

// --- Front bogie ---
ctx.save()
ctx.translate((1/2 - this.overhangRatio) * this.carLength, 0) // move to bogie position
ctx.rotate(frontAngle - angle) // rotate relative to car body
ctx.beginPath()
ctx.moveTo(0, -width / 2)
ctx.lineTo(0, +width / 2)
ctx.stroke()
ctx.restore()

// --- Rear bogie ---
ctx.save()
ctx.translate(-(1/2 - this.overhangRatio) * this.carLength, 0)
ctx.rotate(rearAngle - angle)
ctx.beginPath()
ctx.moveTo(0, -width / 2)
ctx.lineTo(0, +width / 2)
ctx.stroke()
ctx.restore()

		ctx.restore()
	}
}
