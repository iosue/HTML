import { deg } from '../helpers.js'
import * as settings from '../defaults.js'
import { Car, Engine } from './cars.js'

export class Bogie {
  constructor(network, id, pos, carId, trackId, dir=1, color='white', t=0, speed=1) {
    this.network = network
    this.id = id
    this.position = pos
    this.carId = carId
    this.trackId = trackId
    this.direction = dir
    this.color = color
    this.trackPosition = t
    // this.speed = speed
  }
  get x() {return this.track.cartPosAt(this.trackPosition).x}
  get y() {return this.track.cartPosAt(this.trackPosition).y}
  get a() {return this.track.cartPosAt(this.trackPosition).a}
  get car() {return this.network.cars.get(this.carId)||this.network.engines.get(this.carId)}
  get track() {return this.network.tracks.get(this.trackId)}
  get speed() {return this.car.speed}

  get partner() {
    switch (this.position) {
      case "A": return this.car.B
      case "B": return this.car.A
    }
  }

  toLocal(wx, wy) {
    const dx = wx - this.x
    const dy = wy - this.y
    const cos = Math.cos(-this.a)
    const sin = Math.sin(-this.a)
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    }
  }

  followBogie(lead,dist) {
    const leadDistance = lead.track.chordLengthAtPos(lead.trackPosition)
    let thisDistance = leadDistance + dist*lead.direction
    if (thisDistance > lead.track.length) {
      const adjacentTrack = lead.track.nextTrack
      if (!adjacentTrack) return "end of track"
      this.trackId = adjacentTrack.id
      this.direction = (adjacentTrack.dir==1) ? lead.direction : -lead.direction
      thisDistance = (adjacentTrack.dir==1) ? thisDistance - lead.track.length : this.track.length - (thisDistance - lead.track.length)
    } else if (thisDistance < 0) {
      const adjacentTrack = lead.track.prevTrack
      if (!adjacentTrack) return "end of track"
      this.trackId = adjacentTrack.id
      this.direction = (adjacentTrack.dir==1) ? lead.direction : -lead.direction
      thisDistance = (adjacentTrack.dir==1) ? this.track.length - (0 - thisDistance) : 0 - thisDistance
    } else {
      this.trackId = lead.trackId
      this.direction = lead.direction
    }
    this.autoSwitch()
    this.trackPosition = this.track.positionAtDist(thisDistance)
  }

  autoSwitch() {
    const isOnSwitchPoint=this.track.A.switchId?this.track.A:this.track.B.switchId?this.track.B:false
    if (isOnSwitchPoint) {
      const sw = this.network.switches.get(isOnSwitchPoint.switchId)
      sw.currentIndex = sw.points.indexOf(isOnSwitchPoint)
    }
  }

  runThroughJunction(prevPoint) {
    let nextPoint = [...prevPoint.connections.keys()][0]
    if (nextPoint.switchId) {
      const sw = this.network.switches.get(nextPoint.switchId)
      nextPoint = sw.points[sw.currentIndex]
    }
    this.trackId = nextPoint.trackId
    return nextPoint
  }

  update() {
    this.trackPosition += this.direction * this.speed/this.track.length
    if (this.direction*(this.car.gearForward?1:-1)>0 && this.trackPosition>1) {
      if (this.track.B.connections.size==0) {
        this.trackPosition = 1
        this.car.stop()
      } else {
        const nextPoint = this.runThroughJunction(this.track.B)
        if (nextPoint.end=="A") /* >> */ {this.trackPosition--}
        if (nextPoint.end=="B") /* >< */ {
          this.trackPosition = 1-(this.trackPosition-1)
          this.direction = -this.direction
        }
      }
    }
    if (this.direction*Math.sign(this.speed)<0 && this.trackPosition<0) {
      if (this.track.A.connections.size==0) {
        this.trackPosition = 0
        this.car.stop()
      } else {
        const nextPoint = this.runThroughJunction(this.track.A)
        if (nextPoint.end=="B") /* << */ {this.trackPosition++}
        if (nextPoint.end=="A") /* <> */ {
          this.trackPosition = -this.trackPosition
          this.direction = -this.direction
        }
      }
    }
    this.autoSwitch()
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.a + (this.direction<0?Math.PI:0))
      ctx.beginPath()
      ctx.arc(+0,0,9,-Math.PI/2,+Math.PI/2,0)
      ctx.arc(-9,0,9,+Math.PI/2,-Math.PI/2,1)
      ctx.closePath()
      ctx.fillStyle = this.color
      ctx.fill()

      ctx.beginPath()
      ctx.arc(0,0,6,0,Math.PI*2)
      ctx.closePath()
      ctx.fillStyle = "black"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(0,0,3,0,Math.PI*2)
      ctx.closePath()
      ctx.fillStyle = this.color
      ctx.fill()

      ctx.beginPath()
      ctx.rect(-8,-1.5,10,3)
      ctx.closePath()
      ctx.fillStyle = this.color
      ctx.fill()

      // ctx.beginPath()
      // ctx.roundRect(-8,-14,16,28,3)
      // ctx.closePath()
      // ctx.fillStyle = this.color
      // ctx.fill()

      if (this.position=="B") ctx.rotate(Math.PI)

      // if (this.direction==-1) ctx.rotate(Math.PI)
      // if (this.car.direction==-1) ctx.rotate(Math.PI)

      ctx.save()
        ctx.beginPath()
          ctx.moveTo(0,0)
          ctx.lineTo(settings.hitchLength-4.5,0)
          ctx.lineWidth = 4
          ctx.strokeStyle = "#ccc"
        ctx.stroke()
        ctx.beginPath()
          ctx.translate(settings.hitchLength-1.5,0)
          ctx.rotate(this.hitched?deg(-90):0)
          ctx.arc(0,0,3,deg(90),-deg(90))
          ctx.lineWidth = 2
          ctx.strokeStyle = "#ccc"
        ctx.stroke()
      ctx.restore()

    ctx.restore()
  }
}

// export class Hitch extends Car {
//   constructor(bogieA,bogieB) {
//     this.A = bogieA
//     this.B = bogieB
//   }
//   get dist() {
//     let theta = this.B.a - this.A.a
//     let h = settings.hitchLength
//     let A = Math.sin(theta)
//     let B = Math.cos(theta)
//     let l = h * Math.hypot(A,B+1)
//     return l
//   }
// }