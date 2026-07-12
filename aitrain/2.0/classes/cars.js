import { deg } from '../helpers.js'
import * as settings from '../defaults.js'
import { Bogie } from './bogies.js'


export class Car {
  constructor(network,id,color,trackId,t,dir=1,speed=0,length=settings.carLength) {
    this.network = network
    this.id = id
    this.color = color
    this.trackId = trackId
    this.speed = speed
    this.direction = dir
    this.trackPosition = t ?? 0.5+dir*0.3
    this.length = length

    this.A = new Bogie(
      network,
      id+"A", "A",
      this.id, trackId,
      dir, 'cyan', this.trackPosition
    )
    this.B = new Bogie(
      network,
      id+"B", "B",
      this.id, trackId,
      dir, 'white', this.trackPosition
    )
    network.bogies.set(this.A.id,this.A)
    network.bogies.set(this.B.id,this.B)
  }
  get track() {return this.network.tracks.get(this.trackId)}
  // get speed() {return this.train.speed}

  // snapToTrack(end="B") {
  //   const slave = this[end]
  //   const master = slave.partner
  //   // console.log('master',master.track,end=="B" && this.direction>0)
  //   const masterTrackDistance = master.track.chordLengthAtPos(master.trackPosition)
  //   if (end=="B" && this.direction>0) {
  //     let slaveTrackDistance = masterTrackDistance-this.length
  //     if (slaveTrackDistance>0) {
  //       slave.trackId = master.trackId
  //       slave.trackPosition = slave.track.positionAtDist(slaveTrackDistance)
  //     } else {
  //       let prevTrack = master.track.prevTrack
  //       slave.trackId = prevTrack.id
  //       slave.direction *= prevTrack.dir
  //       // console.log(prevTrack)
  //       if (slave.direction<0) {
  //         slave.trackPosition = -slave.track.positionAtDist(slaveTrackDistance)
  //       } else {
  //         slave.trackPosition = 1+slave.track.positionAtDist(slaveTrackDistance)
  //       }
  //       // console.log(slave.trackPosition)
  //     }
  //   } else if (end=="B" && this.direction<0) {
  //     let slaveTrackDistance = masterTrackDistance+this.length
  //     if (slaveTrackDistance>0) {
  //       slave.trackPosition = slave.track.positionAtDist(slaveTrackDistance)
  //     } else {
  //       let nextTrack = master.track.nextTrack
  //       slave.trackId = nextTrack.id
  //       slave.direction *= nextTrack.dir
  //       console.log(nextTrack)
  //       if (slave.direction<0) {
  //         slave.trackPosition = -slave.track.positionAtDist(slaveTrackDistance)
  //       } else {
  //         slave.trackPosition = 1+slave.track.positionAtDist(slaveTrackDistance)
  //       }
  //       console.log(slave.trackPosition)
  //     }
  //   } else if (end=="A" && this.direction>0) {
  //     /// TBD
  //     let slaveTrackDistance = masterTrackDistance-this.length
  //     if (slaveTrackDistance>0) {
  //       slave.trackPosition = slave.track.positionAtDist(slaveTrackDistance)
  //     } else {
  //       let prevTrack = master.track.prevTrack
  //       slave.trackId = prevTrack.id
  //       slave.direction *= prevTrack.dir
  //       console.log(prevTrack)
  //       if (slave.direction<0) {
  //         slave.trackPosition = -slave.track.positionAtDist(slaveTrackDistance)
  //       } else {
  //         slave.trackPosition = 1+slave.track.positionAtDist(slaveTrackDistance)
  //       }
  //       console.log(slave.trackPosition)
  //     }
  //   } else if (end=="A" && this.direction<0) {
  //     /// TBD
  //     let slaveTrackDistance = masterTrackDistance+this.length
  //     if (slaveTrackDistance>0) {
  //       slave.trackPosition = slave.track.positionAtDist(slaveTrackDistance)
  //     } else {
  //       let nextTrack = master.track.nextTrack
  //       slave.trackId = nextTrack.id
  //       slave.direction *= nextTrack.dir
  //       console.log(nextTrack)
  //       if (slave.direction<0) {
  //         slave.trackPosition = -slave.track.positionAtDist(slaveTrackDistance)
  //       } else {
  //         slave.trackPosition = 1+slave.track.positionAtDist(slaveTrackDistance)
  //       }
  //       console.log(slave.trackPosition)
  //     }
  //   } else {
  //     // console.log(end)
  //   }
  // }

  initialize() {
    return this.B.followBogie(this.A,-this.length)
    return this.snapToTrack("B")
    // console.trace(this.A,this.A.track)
    if (this.direction > 0) {
      if (this.length > this.A.track.length*this.A.trackPosition) {
        let connectedPoint = [...this.A.track.A.connections.keys()][0]
        if (connectedPoint.end=="A") {
          this.B.direction = -this.A.direction
          this.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.B.trackId)
          let overflow = this.length-this.A.track.length*this.A.trackPosition
          this.B.trackPosition = overflow/backTrack.length
        } else {
          this.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.B.trackId)
          let overflow = this.length-this.A.track.length*this.A.trackPosition
          this.B.trackPosition = 1 - overflow/backTrack.length
        }
      } else {
        let T = this.A.trackPosition*this.A.track.length
        let D = T - this.length
        this.B.trackId = this.A.trackId
        this.B.trackPosition = D/this.B.track.length
      }
    }
    if (this.direction < 0) {
      if (this.length/this.track.length+this.trackPosition > 1) {
        let connectedPoint = [...this.track.B.connections.keys()][0]
        if (connectedPoint.end=="B") {
          this.B.direction = -this.direction
          this.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.B.trackId)
          let T = this.trackPosition*this.track.length
          let S = this.track.length + backTrack.length - T - this.length
          this.B.trackPosition = S/backTrack.length
        } else {
          this.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.B.trackId)
          let T = this.trackPosition*this.track.length
          let S = T+this.length-this.track.length
          this.B.trackPosition = S/backTrack.length
        }
      } else {
        let T = this.trackPosition*this.track.length
        let S = T + this.length
        this.B.trackPosition = S/this.track.length
      }
    }
    // console.log(this.B)
  }

  // update() {
  //   this.A.update()
  //   this.B.update()
  // }

  stop() {
    this.speed = 0
    // this.train.speed = 0
  }

  draw(ctx) {
    const dx = this.B.x-this.A.x,
          dy = this.B.y-this.A.y,
          dist = Math.hypot(dx,dy),
          angle = Math.atan2(dy,dx)
    ctx.save()
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#aaaa'
      ctx.shadowColor = "black"
      ctx.shadowBlur = 4
      ctx.translate(this.A.x,this.A.y)
      // console.log(this.id,this.direction)
      ctx.rotate(angle)
      let sideOverhang = 10
      let endOverhang = 11
      ctx.beginPath()
        ctx.roundRect(-endOverhang,-sideOverhang+1,this.length+2*endOverhang,2*sideOverhang-2,2)
        ctx.fillStyle = '#50483f'
        ctx.fillStyle = `hsl(from ${this.color} h s 20)`
      ctx.fill()
      ctx.beginPath()
        ctx.roundRect(-endOverhang,-sideOverhang,dist+2*endOverhang,2*sideOverhang,3)
        ctx.strokeStyle = this.color
        ctx.lineWidth=4
        // ctx.fill()
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(1.5*endOverhang,0); ctx.lineTo(dist-1.5*endOverhang,0)
        ctx.moveTo(1.5*endOverhang,0); ctx.lineTo(dist-3.5*endOverhang,-.5*endOverhang)
        ctx.moveTo(1.5*endOverhang,0); ctx.lineTo(dist-3.5*endOverhang,+.5*endOverhang)
        ctx.strokeStyle = this.color
        ctx.lineWidth=2
      ctx.stroke()

      ctx.restore()
  }
}






export class Engine extends Car {
  constructor() {
    super(...arguments)
    this.A.color = "salmon"
    this.B.color = "goldenrod"
    this.maxSpeed = 3
    this.gearForward = true
  }
  get hovered() {return this.id==this.network.hoveredEngineId}
  get activeControl() {return this.id==this.network.activeEngineId}
  
  update() {
    this.targetSpeed ??= this.speed
    let dV = this.targetSpeed-this.speed
    if (this.gearForward) {
      if (dV > 0) {
        this.acceleration = +.075
        this.speed = Math.min(this.speed+this.acceleration,this.maxSpeed)
      } else if (dV < 0) {
        this.acceleration = -.010
        this.speed = Math.max(this.speed+this.acceleration,0)
      } else {
        this.acceleration = 0
      }
      if (this.activeBraking) {
        this.acceleration = -.150
        this.speed = Math.max(this.speed+this.acceleration,0)
      }
    } else {
      if (dV < 0) {
        this.acceleration = -.075
        this.speed = Math.max(this.speed+this.acceleration,-this.maxSpeed)
      } else if (dV > 0) {
        this.acceleration = +.010
        this.speed = Math.min(this.speed+this.acceleration,0)
        // console.log(this.speed)
      } else {
        this.acceleration = 0
      }
      if (this.activeBraking) {
        this.acceleration = +.150
        this.speed = Math.min(this.speed+this.acceleration,0)
      }
    }
    if (this.speed == 0) this.speedLock = false
    this.A.update()
    this.B.followBogie(this.A,-this.length)
  }

  draw(ctx) {
    const dx = this.B.x-this.A.x,
          dy = this.B.y-this.A.y,
          dist = Math.hypot(dx,dy),
          angle = Math.atan2(dy,dx)
    ctx.save()
      ctx.translate(this.A.x,this.A.y)
      ctx.rotate(angle)
      if (this.gearForward) {
        ctx.save()
          ctx.shadowColor = "white"
          ctx.shadowBlur = 4
          ctx.beginPath()
            ctx.arc(0,0,12,deg(180-30),deg(180+30))
            ctx.lineWidth = 4
            ctx.strokeStyle = 'yellow'
            ctx.fillStyle = 'white'
            ctx.stroke()
            ctx.fill()
          ctx.stroke()
        ctx.restore()
        ctx.save()
          ctx.translate(this.length,0)
          ctx.rotate(Math.PI)
          ctx.shadowColor = this.activeBraking?"#F00":"#800"
          ctx.shadowBlur = 4
          ctx.beginPath()
            ctx.arc(0,0,12,deg(180-30),deg(180+30))
            ctx.lineWidth = 4
            ctx.strokeStyle = this.activeBraking?"#F00":"#800"
            ctx.fillStyle = this.activeBraking?"#F00":"#800"
            ctx.stroke()
            ctx.fill()
          ctx.stroke()
        ctx.restore()
      } else {
        ctx.save()
          ctx.shadowColor = this.activeBraking?"#F00":"#800"
          ctx.shadowBlur = 4
          ctx.beginPath()
            ctx.arc(0,0,12,deg(180-30),deg(180+30))
            ctx.lineWidth = 4
            ctx.strokeStyle = this.activeBraking?"#F00":"#800"
            ctx.fillStyle = this.activeBraking?"#F00":"#800"
            ctx.stroke()
            ctx.fill()
          ctx.stroke()
        ctx.restore()
        ctx.save()
          ctx.translate(this.length,0)
          ctx.rotate(Math.PI)
          ctx.shadowColor = "white"
          ctx.shadowBlur = 4
          ctx.beginPath()
            ctx.arc(0,0,12,deg(180-30),deg(180+30))
            ctx.lineWidth = 4
            ctx.strokeStyle = "yellow"
            ctx.fillStyle = "white"
            ctx.stroke()
            ctx.fill()
          ctx.stroke()
        ctx.restore()
      }
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#aaaa'
      ctx.shadowColor = this.hovered?this.activeControl?"goldenrod":"red":this.activeControl?"white":"black"
      ctx.shadowBlur = 4
      let sideOverhang = 10
      let endOverhang = 11
      ctx.beginPath()
        ctx.roundRect(-endOverhang,-sideOverhang,dist+2*endOverhang,2*sideOverhang,3)
        ctx.fillStyle = this.color
        ctx.fill()
      ctx.stroke()
      ctx.translate(this.acceleration*10,0)
      ctx.beginPath()
        ctx.roundRect(this.length*1/2+endOverhang/2,-sideOverhang-2,this.length*1/2,2*sideOverhang+4,2)
        ctx.fillStyle = '#333'
        ctx.fill()
      ctx.stroke()
      ctx.beginPath()
        ctx.arc(0,0,9,0,Math.PI*2)
        ctx.fillStyle = '#333'
        ctx.fill()
      ctx.stroke()
      ctx.beginPath()
        ctx.arc(0,0,6,0,Math.PI*2)
        ctx.fillStyle = 'black'
        ctx.fill()
      ctx.stroke()

    ctx.restore()
  }
}