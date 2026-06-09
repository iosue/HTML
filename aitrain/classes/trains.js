import { TrackSection, CurvedTrackSection, SwitchSection } from "./tracks.js"
import { TrackNetwork } from "./network.js"

// -----------------------------
// TRAIN
// -----------------------------
export class Train {
	constructor(id, track, speed = 40, network = null) {
		this.id = id
		this.track = track
		this.t = 0
		this.speed = speed
		this.forward = true
		this.network = network // store reference
	}

	findPreviousTrack(current) {
		if (!this.network) return null
		for (const section of this.network.sections.values()) {
			if (section.next.includes(current)) return section
		}
		return null
	}

	update(dt) {
		const dist = this.speed * dt
		const deltaT = dist / this.track.length
		this.t += this.forward ? deltaT : -deltaT

		if (this.t >= 1) {
			this.t = 1
			this.forward = false

			const nextTrack =
				this.track instanceof SwitchSection
					? this.track.getActiveNext()
					: this.track.next[0]

			if (nextTrack) {
				this.track = nextTrack
				this.t = 0
				this.forward = true
			}
		} else if (this.t <= 0) {
			this.t = 0
			this.forward = true

			const prevTrack = this.findPreviousTrack(this.track)
			if (prevTrack) {
				if (prevTrack instanceof SwitchSection) {
					const index = prevTrack.next.indexOf(this.track)
					if (index !== -1) prevTrack.setRoute(index)
				}

				this.track = prevTrack
				this.t = 1
				this.forward = false
			}
		}
	}
	isOnSection(section) {
		return this.track === section
	}

	draw(ctx) {
		const p = this.track.getPointAt(this.t)
		ctx.fillStyle = this.forward ? "red" : "blue"
		ctx.beginPath()
		ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
		ctx.fill()
	}
}
