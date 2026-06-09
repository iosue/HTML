			import { TrackSection, CurvedTrackSection, SwitchSection } from "./tracks.js"
			import { TrackNetwork } from "./network.js"

// -----------------------------
// TRAIN
// -----------------------------
export class Train {
  constructor(id, track, speed = 40) {
    this.id = id
    this.track = track // TrackSection
    this.t = 0 // position along track (0..1)
    this.speed = speed // px per second
  }

  update(dt) {
    const dist = this.speed * dt
    const deltaT = dist / this.track.length
    this.t += deltaT

    if (this.t >= 1) {
      this.t = 0

      // choose next track
      if (this.track instanceof SwitchSection) {
        this.track = this.track.getActiveNext()
      } else {
        this.track = this.track.next[0]
      }
    }
  }

  draw(ctx) {
    const p = this.track.getPointAt(this.t)
    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
    ctx.fill()
  }
}
