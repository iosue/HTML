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


  old_update() {
    this.trackPosition += this.direction * this.speed/this.track.length
    if (this.trackPosition > 1) {
      // console.log(this.track.B)
      let nextTrack
      if (this.track.B.reversedPoint) {
        this.direction -= this.direction*2
        console.log('\nthis.track.B',this.track.B)
        console.log('this.direction',this.direction)
        console.log('this.track.B.activeIn',this.track.B.activeIn,[...this.track.B.in.values()][0])
        console.log('[...this.track.B.in.values()].map(t=>t.id)',[...this.track.B.in.values()].map(t=>t.id))
        console.log('this.track.B.activeOut',this.track.A.activeOut,[...this.track.A.out.values()][0])
        console.log('[...this.track.B.out.values()].map(t=>t.id)',[...this.track.B.out.values()].map(t=>t.id))
        nextTrack = this.direction>0 ?
          this.track.B.activeIn ?? [...this.track.B.in.values()][0] :
          this.track.A.activeOut ?? [...this.track.A.out.values()][0]
        console.log(this.track.id,'next=',nextTrack)
      } else {
        nextTrack = this.direction>0 ?
          this.track.B.activeOut ?? [...this.track.B.out.values()][0] :
          this.track.A.activeIn ?? [...this.track.A.in.values()][0]
      }
      this.track.occupied = false
      this.track = nextTrack
      this.track.occupied = true
    }
    // if (this.trackPosition < 0) debugger
    this.trackPosition++
    this.trackPosition %= 1
  }

  update() {
    this.trackPosition += this.direction * this.speed/this.track.length
    // console.log('-----------')
    if (this.trackPosition > 1) {
      // console.log('trackPosition > 1')
      if (this.direction > 0) {
        if (this.track.B.in.has(this.track) && this.track.B.out.has(this.track)) {
          throw new Error([`${this.track.id} is listed as BOTH 'in' and 'out' of ${this.track.B.id}`])
        } else if (this.track.B.in.has(this.track)) {
          // console.log('this.track.B.in.has(this.track)')
          let nextTrack = this.track.B.activeOut ?? [...this.track.B.out.values()][0]
          // console.log('next track:',nextTrack)
          this.track = nextTrack
        } else if (this.track.B.out.has(this.track)) {
          // console.log('this.track.B.out.has(this.track)')
          let nextTrack = this.track.B.activeIn ?? [...this.track.B.in.values()][0]
          // console.log('next track:',nextTrack)
          this.track = nextTrack
          this.direction -= 2*this.direction
          // console.log(this.direction)
        } else {
          throw new Error([`${this.track.id} not associated with ${this.track.B.id}`])
        }
      } else {
        console.log('trackPosition > 1')
        console.log('direction',this.direction)
      }
    } else if (this.trackPosition < 0) {
      if (this.direction < 0) {
        if (this.track.A.out.has(this.track) && this.track.A.in.has(this.track)) {
          throw new Error([`${this.track.id} is listed as BOTH 'in' and 'out' of ${this.track.A.id}`])
        } else if (this.track.A.in.has(this.track)) {
          console.log('this.track.A.in.has(this.track)')
          // let nextTrack = this.track.A.activeOut ?? [...this.track.A.out.values()][0]
          console.log('next track:',nextTrack)
          // this.track = nextTrack
        } else if (this.track.A.out.has(this.track)) {
          console.log('this.track.A.out.has(this.track)')
          // let nextTrack = this.track.A.activeIn ?? [...this.track.A.in.values()][0]
          console.log('next track:',nextTrack)
          // this.track = nextTrack
          // this.direction -= 2*this.direction
          console.log(this.direction)
        } else {
          throw new Error([`${this.track.id} not associated with ${this.track.A.id}`])
        }
      } else {
        console.log('trackPosition < 0')
        console.log('direction',this.direction)
      }
    }
    this.trackPosition++
    this.trackPosition %= 1
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.a)

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