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

  toLocal(wx, wy) {
    // console.error(this,this.a) 
    const dx = wx - this.x
    const dy = wy - this.y
    const cos = Math.cos(-this.a)
    const sin = Math.sin(-this.a)
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    }
  }

  get partner() {
    switch (this.position) {
      case "A": return this.car.B
      case "B": return this.car.A
    }
  }

  old_setRelativeTrackPos(prevCar,dist) {
    console.log(prevCar)
    let trackId,t,dir,speed

    if (this.direction > 0) {
      if (this.length > this.track.length*this.trackPosition) {
        let connectedPoint = [...this.track.A.connections.keys()][0]
        if (connectedPoint.end=="A") {
          this.track.B.direction = -this.track.A.direction
          this.track.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.track.B.trackId)
          let overflow = this.length-this.A.track.length*this.A.trackPosition
          this.B.trackPosition = overflow/backTrack.length
        } else {
          this.B.trackId = connectedPoint.trackId
          let backTrack = this.network.tracks.get(this.B.trackId)
          let overflow = this.length-this.A.track.length*this.A.trackPosition
          this.B.trackPosition = 1 - overflow/backTrack.length
        }
      } else {
        let T = this.trackPosition*this.track.length
        let D = T - this.length
        this.track.B.trackId = this.track.A.trackId
        this.track.B.trackPosition = D/this.track.length
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

    this.trackId = trackId
    this.trackPosition = t
    this.direction = dir
    if (this.position == "A") {
      this.car.speed = speed
      this.car.initialize()
    } else {
      this.car.speed = speed
      this.car.bactialize(`reset pos ${trackId} ${t} ${dir}`)
    }
  }


  followBogie(lead,dist,log=false) {
    const leadDistance = lead.track.chordLengthAtPos(lead.trackPosition)
    let thisDistance = leadDistance + dist*lead.direction
    if (thisDistance > lead.track.length) {
      log?console.log(this,lead,thisDistance,'>',lead.track.length):{}
      const adjacentTrack = lead.track.nextTrack
      if (!adjacentTrack) return "end of track"
      this.trackId = adjacentTrack.id
      this.direction = (adjacentTrack.dir==1) ? lead.direction : -lead.direction
      // thisDistance = (this.direction==1) ? this.track.length - (thisDistance - lead.track.length) : thisDistance - lead.track.length
      thisDistance = (adjacentTrack.dir==1) ? thisDistance - lead.track.length : this.track.length - (thisDistance - lead.track.length)
    } else if (thisDistance < 0) {
      log?console.log(this,lead,thisDistance,'<',0):{}
      const adjacentTrack = lead.track.prevTrack
      if (!adjacentTrack) return "end of track"
      this.trackId = adjacentTrack.id
      this.direction = (adjacentTrack.dir==1) ? lead.direction : -lead.direction
      // thisDistance = (this.direction==1) ? this.track.length - (0 - thisDistance) : 0 - thisDistance
      thisDistance = (adjacentTrack.dir==1) ? this.track.length - (0 - thisDistance) : 0 - thisDistance
    } else {
      log?console.log(this,lead,'else'):{}
      this.trackId = lead.trackId
      this.direction = lead.direction
    }
    this.trackPosition = this.track.positionAtDist(thisDistance)
  }

  o_followBogie(lead, dist) {
    const leadForward = lead.direction > 0
    const thisForward = this.direction > 0

    const leadPos = leadForward ? lead.trackPosition : 1 - lead.trackPosition;
    const overflow = dist - lead.track.chordLengthAtPos(leadPos);
    const overshoots = overflow > 0;
    const adjacentTrack = leadForward ? lead.track.prevTrack : lead.track.nextTrack;

    if (leadForward) {
      if (thisForward) {
        if (overshoots) {
          // '>>o'
          if (!adjacentTrack) return "end of track"
          this.trackId = adjacentTrack.id;
          if (adjacentTrack.dir > 0) {
            this.trackPosition = this.track.positionAtDist(this.track.length - overflow);
          } else {
            this.direction = -lead.direction;
            this.trackPosition = this.track.positionAtDist(overflow);
          }
        } else {
          // '>>'
          this.trackId = lead.trackId;
          this.trackPosition = this.track.positionAtDist(-overflow);
        }
      } else {
        if (overshoots) {
          // '<>o'
          if (!adjacentTrack) return "end of track"
          this.trackId = adjacentTrack.id;
          this.trackPosition = this.track.positionAtDist(overflow);
        } else {
          // '<>'
          this.direction = lead.direction;
          this.trackId = lead.trackId;
          this.trackPosition = this.track.positionAtDist(-overflow);
        }
      }
    } else {
      if (thisForward) {
        if (overshoots) {
          // '><o'
          if (!adjacentTrack) return "end of track"
          this.trackId = adjacentTrack.id;
          this.trackPosition = this.track.positionAtDist(this.track.length - overflow);
        } else {
          // '><'
          this.direction = lead.direction;
          this.trackId = lead.trackId;
          this.trackPosition = this.track.positionAtDist(this.track.length + overflow);
        }
      } else {
        if (overshoots) {
          // '<<o'
          if (!adjacentTrack) return "end of track"
          this.trackId = adjacentTrack.id;
          if (adjacentTrack.dir > 0) {
            this.trackPosition = this.track.positionAtDist(-overflow);
          } else {
            this.direction = -lead.direction;
            this.trackPosition = this.track.positionAtDist(this.track.length - overflow);
          }
        } else {
          // '<<'
          this.trackId = lead.trackId;
          this.trackPosition = this.track.positionAtDist(this.track.length + overflow);
        }
      }
    }
  }

  // myfollowBogie(lead,dist) {
  //   const leadForward = lead.direction>0
  //   const thisForward = this.direction>0

  //   const leadPos = leadForward ? lead.trackPosition : 1-lead.trackPosition
  //   const overflow = dist-lead.track.chordLengthAtPos(leadPos)
  //   const overshoots = overflow>0
  //   const adjacentTrack = leadForward ? lead.track.prevTrack : lead.track.nextTrack

  //   if (leadForward) {
  //     if (thisForward) {
  //       if (overshoots) {
  //         console.log('>>o')
  //         this.trackId = adjacentTrack?.id
  //         if (adjacentTrack.dir>0) {
  //           this.trackPosition = this.track.positionAtDist(this.track.length-overflow)
  //         } else {
  //           this.direction = -lead.direction
  //           this.trackPosition = this.track.positionAtDist(overflow)
  //         }
  //       } else {
  //         console.log('>>')
  //         this.trackId = lead.trackId
  //         this.trackPosition = this.track.positionAtDist(-overflow)
  //       }
  //     } else {
  //       if (overshoots) {
  //         console.log('<>o')
  //         this.trackId = adjacentTrack?.id
  //         this.trackPosition = this.track.positionAtDist(overflow)
  //       } else {
  //         console.log('<>')
  //         this.direction = lead.direction
  //         this.trackId = lead.trackId
  //         this.trackPosition = this.track.positionAtDist(-overflow)
  //       }
  //     }
  //   } else {
  //     if (thisForward) {
  //       if (overshoots) {
  //         console.log('><o')
  //         this.trackId = adjacentTrack?.id
  //         this.trackPosition = this.track.positionAtDist(this.track.length-overflow)
  //       } else {
  //         console.log(this.id,'><')
  //         this.direction = lead.direction
  //         this.trackId = lead.trackId
  //         this.trackPosition = this.track.positionAtDist(this.track.length+overflow)
  //       }
  //     } else {
  //       if (overshoots) {
  //         console.log('<<o')
  //         this.trackId = adjacentTrack?.id
  //         if (adjacentTrack.dir>0) {
  //           this.trackPosition = this.track.positionAtDist(-overflow)
  //         } else {
  //           this.direction = -lead.direction
  //           this.trackPosition = this.track.positionAtDist(this.track.length-overflow)
  //         }
  //       } else {
  //         console.log('<<')
  //         this.trackId = lead.trackId
  //         this.trackPosition = this.track.positionAtDist(this.track.length+overflow)
  //       }
  //     }
  //   }
  // }

  // _followBogie(relativeBogie,offsetDistance) {
  //   console.log(relativeBogie.direction)
  //   if (this.direction == relativeBogie.direction) {
  //     if (relativeBogie.direction>0) {
  //       const relativeTrackDistance = relativeBogie.track.length*(0+relativeBogie.trackPosition)
  //       const overflow = offsetDistance - relativeTrackDistance
  //       if (overflow>0) {
  //         if (this.track.direction==relativeBogie.track.direction) {
  //           this.trackId = relativeBogie.track.prevTrack.id
  //           this.trackPosition = 1 - overflow / this.track.length
  //         } else {
  //           console.warn('wrap')
  //         }
  //       } else {
  //         this.trackId = relativeBogie.trackId
  //         this.trackPosition = 0 - overflow / this.track.length
  //       }
  //     } else {
  //       const relativeTrackDistance = relativeBogie.track.length*(1-relativeBogie.trackPosition)
  //       const overflow = offsetDistance - relativeTrackDistance
  //       if (overflow>0) {
  //         this.trackId = relativeBogie.track.nextTrack.id
  //         this.trackPosition = 1 - overflow / this.track.length
  //       } else {
  //         this.trackId = relativeBogie.trackId
  //         this.trackPosition = 0 - overflow / this.track.length
  //         this.direction -= 2*this.direction
  //       }
  //     }
  //   } else {
  //     console.error('reverse')
  //   }
  // }

  // setRelativeTrackPos(prevBogie,dist) {
    
  //   // console.log(prevBogie.trackPosition*prevBogie.track.length)
  //   if (prevBogie.direction>0) {
  //     if (prevBogie.trackPosition*prevBogie.track.length>prevBogie.car.length) {
  //       console.log('standard shift')
  //       this.trackId = prevBogie.trackId
  //       this.trackPosition = prevBogie.trackPosition - dist/100
  //     } else {
  //       this.trackId = prevBogie.track.prevTrack.id
  //       this.trackPosition = prevBogie.trackPosition - dist/100 + 1
  //     }
  //   }
  //   this.car.snapToTrack("B")
  //   // console.log(this.partner)
  // }

  update() {
    this.trackPosition += this.direction * this.speed/this.track.length
    if (this.direction*Math.sign(this.speed)>0 && this.trackPosition>1) {
      if (this.track.B.connections.size==0) {
        this.trackPosition = 1
        if (settings.bounce) {
          this.train.direction = -this.direction
          console.warn('bounce')
        } else {
          this.car.stop()
        }
      } else {
        let prevPoint = this.track.B,
            nextPoint = [...prevPoint.connections.keys()][0]
        if (nextPoint.switchId) {
          const sw = this.network.switches.get(nextPoint.switchId)
          nextPoint = sw.points[sw.currentIndex]
        }
        if (prevPoint.switchId) {
          const sw = this.network.switches.get(prevPoint.switchId)
          sw.currentIndex = sw.points.indexOf(prevPoint)
        }
        if (nextPoint.end=="A") /* >> */ {this.trackPosition--}
        if (nextPoint.end=="B") /* >< */ {
          this.trackPosition = 1-(this.trackPosition-1)
          this.direction-=2*this.direction
        }
        this.trackId = nextPoint.trackId
      }
    }
    if (this.direction*Math.sign(this.speed)<0 && this.trackPosition<0) {
      if (this.track.A.connections.size==0) {
        this.trackPosition = 0
        if (settings.bounce) {
          this.train.direction = -this.train.direction
          console.warn('bounce')
        } else {
          this.car.stop()
        }
      } else {
        let prevPoint = this.track.A,
              nextPoint = [...prevPoint.connections.keys()][0]
        if (nextPoint.switchId) {
          const sw = this.network.switches.get(nextPoint.switchId)
          nextPoint = sw.points[sw.currentIndex]
        }
        if (prevPoint.switchId) {
          const sw = this.network.switches.get(prevPoint.switchId)
          sw.currentIndex = sw.points.indexOf(prevPoint)
        }
        if (nextPoint.end=="A") /* <> */ {
          this.trackPosition = -this.trackPosition
          this.direction = -this.direction
        }
        if (nextPoint.end=="B") /* << */ {this.trackPosition++}
        this.trackId = nextPoint.trackId
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

      // ctx.beginPath()
      // ctx.roundRect(-8,-14,16,28,3)
      // ctx.closePath()
      // ctx.fillStyle = this.color
      // ctx.fill()

      if (this.position=="B") ctx.rotate(Math.PI)

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