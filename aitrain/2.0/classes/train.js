import { deg } from '../helpers.js'

export class Bogie {
  constructor(id, track, dir=1, color, speed=1, t=0, car, pos) {
    this.id = id
    this.track = track
    this.direction = dir
    this.color = color
    this.speed = speed
    this.trackPosition = t
    this.car = car
    this.position = pos
  }
  get x() {return this.track.posAt(this.trackPosition).x}
  get y() {return this.track.posAt(this.trackPosition).y}
  get a() {return this.track.posAt(this.trackPosition).a}


  update(network) {
    this.trackPosition += this.direction * this.speed/this.track.length
    if (this.direction>0 && this.trackPosition>1) {
      if (this.track.B.connections.size==0) {
        this.trackPosition = 1
        this.direction = -this.direction
        console.warn('bounce')
      } else {
        const prevPoint = this.track.B,
              nextPoint = [...prevPoint.connections.keys()][0]
        if (nextPoint.switchId) {
          const sw = network.switches.get(nextPoint.switchId)
          nextPoint = sw.points[sw.currentIndex]
        }
        if (prevPoint.switchId) {
          const sw = network.switches.get(prevPoint.switchId)
          sw.currentIndex = sw.points.indexOf(prevPoint)
        }
        if (nextPoint.end=="A") /* >> */ {this.trackPosition--}
        if (nextPoint.end=="B") /* >< */ {
          this.trackPosition = 1-(this.trackPosition-1)
          this.direction-=2*this.direction
        }
        this.track = network.tracks.get(nextPoint.trackId)
      }
    }
    if (this.direction<0 && this.trackPosition<0) {
      if (this.track.A.connections.size==0) {
        this.trackPosition = 0
        this.direction = -this.direction
        console.warn('bounce')
      } else {
        const prevPoint = this.track.A,
              nextPoint = [...prevPoint.connections.keys()][0]
        console.log(this.track.A.connections)
        if (nextPoint.switchId) {
          const sw = network.switches.get(nextPoint.switchId)
          nextPoint = sw.points[sw.currentIndex]
        }
        if (prevPoint.switchId) {
          const sw = network.switches.get(prevPoint.switchId)
          sw.currentIndex = sw.points.indexOf(prevPoint)
        }
        if (nextPoint.end=="A") /* <> */ {
          this.trackPosition = -this.trackPosition
          this.direction = -this.direction
        }
        if (nextPoint.end=="B") /* << */ {this.trackPosition++}
        this.track = network.tracks.get(nextPoint.trackId)
      }
    }

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

    ctx.restore()
  }
}

export class Traction extends Bogie {
  constructor() {
    super() 
  }
}

export class Car {
  constructor() {}
}

export class Engine extends Car {
  constructor() {
    super()
  }
}