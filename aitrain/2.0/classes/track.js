import * as settings from '../defaults.js'
import { deg, normalizeAngle } from '../helpers.js'

export class Point {
  constructor(x=0, y=0, a=deg(10), track, end, id=crypto.randomUUID()) {
    this.id = id
    this.x = x
    this.y = y
    this.a = a
    this.trackId = track
    this.end = end
    this.connections = new Map()
    this.merges = new Map()
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

  switch(sw,network) {
    let blocked=false
    sw.points.forEach(point=>{
      let track = network.tracks.get(point.trackId)
      network.bogies.values().forEach(bogie=>{
        if (bogie.track == track) {
          blocked = true
          console.warn(`track ${track.id} occupied by ${bogie.id} @ ${bogie.trackPosition}`)
        }
      })
    })
    if (!blocked) {
      sw.currentIndex++
      sw.currentIndex %= sw.points.length
    }
  }

  draw(ctx) {
    let hoveredSwitch = this.network.switches.get(this.network.hoveredSwitchId)
    if (this.end == "A" && this.merges.size>0) {
      if (hoveredSwitch?.points.includes(this)) {
        ctx.save()
          ctx.beginPath()
          ctx.translate(this.x,this.y)
          ctx.rotate(this.a)
          ctx.arc(0,0,settings.clickRadius*3/2,-Math.PI/2,+Math.PI/2)
          ctx.lineWidth=4
          ctx.strokeStyle="greenyellow"
          ctx.stroke()
        ctx.restore()
      } else {
        ctx.save()
          ctx.beginPath()
          ctx.translate(this.x,this.y)
          ctx.rotate(this.a)
          ctx.arc(0,0,settings.clickRadius*2/2,-Math.PI/2,+Math.PI/2)
          ctx.lineWidth=4
          ctx.strokeStyle="#fff2"
          ctx.stroke()
        ctx.restore()
      }
    }
    if (this.end == "B" && this.merges.size>0) {
      if (hoveredSwitch?.points.includes(this)) {
        ctx.save()
          ctx.beginPath()
          ctx.translate(this.x,this.y)
          ctx.rotate(this.a)
          ctx.arc(0,0,settings.clickRadius*3/2,Math.PI*1/2,Math.PI*3/2)
          ctx.lineWidth=4
          ctx.strokeStyle="goldenrod"
          ctx.stroke()
        ctx.restore()
      } else {
        ctx.save()
          ctx.beginPath()
          ctx.translate(this.x,this.y)
          ctx.rotate(this.a)
          ctx.arc(0,0,settings.clickRadius*2/2,Math.PI*1/2,Math.PI*3/2)
          ctx.lineWidth=4
          ctx.strokeStyle="#fff2"
          ctx.stroke()
        ctx.restore()
      }
    }
    if (settings.showLabels) {
      ctx.save()
      ctx.strokeStyle = "grey"
        ctx.translate(this.x,this.y)
        ctx.rotate(this.a-Math.PI/2)
        ctx.lineWidth=4
        ctx.strokeStyle="#000"
        ctx.fillStyle="cyan"
        ctx.textAlign=this.id[this.id.length-1]=="A"?"left":"right"
        ctx.textBaseline="middle"
        ctx.strokeText(this.id,this.id[this.id.length-1]=="A"?35:-35,0)
        ctx.fillText(this.id,this.id[this.id.length-1]=="A"?35:-35,0)
      ctx.restore()
    }

    if (this.connections.size>0) {
      const that = [...this.connections.keys()][0],
            dx = that.x-this.x,
            dy = that.y-this.y,
            dist = Math.hypot(dx,dy),
            angle = Math.atan2(dy,dx)
      ctx.save()
        ctx.beginPath()
          ctx.translate(this.x,this.y)
          ctx.rotate(angle)
            ctx.moveTo(0,1.5)
            ctx.lineTo(dist,1.5)
          ctx.setLineDash([4])
          ctx.strokeStyle = 'salmon'
        ctx.stroke()
      ctx.restore()
    } else {
      ctx.save()
        ctx.translate(this.x,this.y)
        ctx.rotate(this.a)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        let side = this.end=="A"?1:-1
        ctx.save()
          ctx.beginPath()
            ctx.rect(-side*20,-settings.trackWidth*2,side*20,settings.trackWidth*4)
            ctx.fillStyle="#000"
          ctx.fill()
          ctx.beginPath()
            ctx.arc(-side*20,0,settings.trackWidth*2,side*Math.PI/2,-side*Math.PI/2)
          ctx.fill()
          ctx.beginPath()
            ctx.rect(-side*20,-settings.trackWidth*3/2,side*20,settings.trackWidth*3)
            ctx.fillStyle="#281f18"
          ctx.fill()
          ctx.beginPath()
            ctx.arc(-side*20,0,settings.trackWidth*3/2,side*Math.PI/2,-side*Math.PI/2)
          ctx.fill()
          ctx.beginPath()
            ctx.rect(-side,-settings.trackWidth,side*1,settings.trackWidth*2)
            ctx.fillStyle="#864"
          ctx.fill()
          ctx.beginPath()
            ctx.rect(-side*6,-settings.trackWidth/2,side*6,settings.trackWidth)
            ctx.fillStyle="#666"
          ctx.fill()
        ctx.restore()
      ctx.restore()
    }
  }
  drawStops(ctx) {
    if (this.connections.size<1) {
      ctx.save()
        ctx.globalAlpha = 1
        ctx.translate(this.x,this.y)
        ctx.rotate(this.a)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.shadowColor = "black"
        ctx.shadowBlur = 4
        let side = this.end=="A"?1:-1
        ctx.save()
          ctx.beginPath()
            ctx.rect(-side*24,-settings.trackWidth+4,side*8,-settings.trackWidth/2)
            ctx.fillStyle="#555"
          ctx.fill()
          ctx.beginPath()
            ctx.rect(-side*24,settings.trackWidth-4,side*8,+settings.trackWidth/2)
          ctx.fill()
          ctx.beginPath()
            ctx.rect(-side*16,-2*settings.trackWidth+3,side*4,4*settings.trackWidth-6)
            ctx.fillStyle="#864"
          ctx.fill()
        ctx.restore()
      ctx.restore()
    }
  }
}

export class Track {
  constructor(id=crypto.randomUUID()) {
    this.id = id
    this.reverse = false
    this.reverseA = false
    this.reverseB = false
  }
  get prevTrack() {
    let connection = [...this.A.connections.keys()][0]
    if (this.A.connections.size>1) {
      let sw = connection.network.switches.get(connection.switchId)
      connection = sw.points[sw.currentIndex]
    }
    if (!connection) return //console.warn(`Track ${this.id} has no previous track to snap a car to.`)
    // console.log(this.A.end,connection.end)
    return {
      id: connection.trackId,
      dir: this.A.end==connection.end?-1:1
    }
  }
  get nextTrack() {
    let connection = [...this.B.connections.keys()][0]
    if (this.B.connections.size>1) {
      let sw = connection.network.switches.get(connection.switchId)
      connection = sw.points[sw.currentIndex]
    }
    if (!connection) return //console.warn(`Track ${this.id} has no previous track to snap a car to.`)
    // console.log(this.B.end,connection.end)
    return {
      id: connection.trackId,
      dir: this.B.end==connection.end?-1:1
    }
  }
}

export class StraightTrack extends Track {
  constructor(id, l=settings.standardLength, x=0, y=0, a=0) {
    super(id)
    this.id = id
    this.length = l
    this.A = new Point(x, y, a, this.id, "A", `${this.id}-A`),
    this.B = new Point(
            x + this.length*Math.cos(a),
            y + this.length*Math.sin(a),
            a, this.id, "B", `${this.id}-B`
          )
  }

  cartPosAt(t) {
    return {
      x: this.A.x + this.length * t * Math.cos(this.A.a),
      y: this.A.y + this.length * t * Math.sin(this.A.a),
      a: this.A.a || this.B.a,
    }
  }

  setA(point, direction) {
    this.A.x = point.x
    this.A.y = point.y
    this.A.a = normalizeAngle(point.a + (direction<0?Math.PI:0))

    this.B.x = this.A.x + this.length * Math.cos(this.A.a)
    this.B.y = this.A.y + this.length * Math.sin(this.A.a)
    this.B.a = this.A.a
  }

  setB(point, direction) {
    this.B.x = point.x
    this.B.y = point.y
    this.B.a = normalizeAngle(point.a + (direction<0?Math.PI:0))

    this.A.x = this.B.x - this.length * Math.cos(this.B.a)
    this.A.y = this.B.y - this.length * Math.sin(this.B.a)
    this.A.a = this.B.a
  }

  chordLengthAtPos(t=0) {
    return t*this.length
  }
  positionAtDist(d=0) {
    return d/this.length
  }

  draw(ctx) {
    ctx.save()
      ctx.translate(this.A.x,this.A.y)
      ctx.rotate(normalizeAngle(this.A.a + this.reverse*Math.PI))

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.strokeStyle='#000'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*4
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.strokeStyle='#281f18'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*3
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.strokeStyle='#864'
        ctx.setLineDash([1,this.length/10 - 2,1,0])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.setLineDash([])
        ctx.lineCap = settings.trackLineCap
        ctx.strokeStyle='#666'
        ctx.lineWidth=settings.trackWidth
      ctx.stroke()

      if (settings.showLabels) {
        ctx.save()
          ctx.globalAlpha=1.5
          ctx.beginPath()
            ctx.moveTo(this.length/2-5+10,-10)
            ctx.lineTo(this.length/2+5+10,+0.)
            ctx.lineTo(this.length/2-5+10,+10)
            ctx.strokeStyle=this.length==100?'red':'orange'
            ctx.lineWidth=1
          ctx.stroke()
  
          ctx.lineWidth=2
          ctx.strokeStyle="#000"
          ctx.fillStyle="#ff8"
          ctx.textAlign="center"
          ctx.textBaseline="middle"
          ctx.strokeText(this.id, this.length/2, 0)
          ctx.fillText(this.id, this.length/2, 0)
        ctx.restore()
      }

      ctx.beginPath()
      ctx.moveTo(this.length,0)
    ctx.restore()
  }
}


export class CurvedTrack extends Track {
  constructor(id, s='L', r=settings.standardLength*2, x=0, y=0, a=deg(0)) {
    super(id)
    this.id = id
    this.radius = r
    this.sweep = (s=="L"?-1:1)*deg(30)
    this.A = new Point(x, y, a, this.id, "A", `${this.id}-A`)
    this.O = {
      x: x + r * Math.cos(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      y: y + r * Math.sin(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      a: a + (this.sweep<0 ? Math.PI/2 : -Math.PI/2)
    }
    this.B = new Point(
      this.O.x + r * Math.cos(this.O.a + this.sweep),
      this.O.y + r * Math.sin(this.O.a + this.sweep),
      a + this.sweep, this.id, "B", `${this.id}-B`
    )
		this.length = r * Math.abs(this.sweep)
	}

  cartPosAt(t) {
    return {
      x: this.O.x + this.radius * Math.cos(this.O.a + this.sweep * t),
      y: this.O.y + this.radius * Math.sin(this.O.a + this.sweep * t),
      a: this.O.a + (this.sweep>0?1:-1)*Math.PI/2 + this.sweep * t
    }
  }


  setA(point,direction) {
    this.A.x = point.x
    this.A.y = point.y
    this.A.a = point.a + (direction<0?Math.PI:0)

    this.O.x = this.A.x + this.radius * Math.cos(this.A.a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2))
    this.O.y = this.A.y + this.radius * Math.sin(this.A.a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2))
    this.O.a = normalizeAngle(this.A.a + (this.sweep<0 ? Math.PI/2 : -Math.PI/2))

    this.B.x = this.O.x + this.radius * Math.cos(this.O.a + this.sweep)
    this.B.y = this.O.y + this.radius * Math.sin(this.O.a + this.sweep)
    this.B.a = normalizeAngle(this.A.a + this.sweep)
  }

  setB(point,direction) {
    this.B.x = point.x
    this.B.y = point.y
    this.B.a = point.a + (direction<0?Math.PI:0)

    const angle = this.B.a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)

    this.O.x = this.B.x + this.radius * Math.cos(angle)
    this.O.y = this.B.y + this.radius * Math.sin(angle)
    this.O.a = normalizeAngle(point.a - this.sweep + ((direction*this.sweep)<0 ? Math.PI/2 : -Math.PI/2))

    this.A.x = this.O.x + this.radius * Math.cos(this.O.a)
    this.A.y = this.O.y + this.radius * Math.sin(this.O.a) + 0
    this.A.a = normalizeAngle(this.B.a - this.sweep)
  }

  chordLengthAtPos(t=0) {
    return 2*this.radius*Math.sin(t*Math.abs(this.sweep)/2)
  }
  positionAtDist(d=0) {
    return 2*Math.asin(d/2/this.radius)/Math.abs(this.sweep)
  }

  draw(ctx) {
    ctx.save()
      ctx.translate(this.O.x,this.O.y)
      ctx.rotate(this.O.a)

      // black background
      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#000'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*4
      ctx.stroke()

      // dirt/gravel
      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#281f18'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*3
      ctx.stroke()

      // rail ties
      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#864'
        ctx.setLineDash([1,settings.standardLength*2*deg(30)/10-2,1,0])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      // iron
      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.setLineDash([])
        ctx.lineCap = settings.trackLineCap
        ctx.lineWidth = settings.trackWidth
        ctx.strokeStyle='#666'
      ctx.stroke()

      // track id label
      if (settings.showLabels) {
        ctx.globalAlpha=1
        ctx.save()
          ctx.rotate(this.sweep/2)
          ctx.translate(this.radius,0)
          ctx.rotate(Math.PI/2+(this.sweep<0)*Math.PI)
  
          ctx.beginPath()
            ctx.moveTo(-5+10,-10)
            ctx.lineTo(+5+10,+0.)
            ctx.lineTo(-5+10,+10)
            ctx.strokeStyle='yellow'
            ctx.lineWidth=1
          ctx.stroke()
  
          ctx.lineWidth=2
          ctx.strokeStyle="#000"
          ctx.fillStyle="#fff"
          ctx.textAlign="center"
          ctx.textBaseline="middle"
          ctx.strokeText(this.id, 0, 0)
          ctx.fillText(this.id, 0, 0)
        ctx.restore()
      }

      // track direction label
      ctx.beginPath()
      ctx.moveTo(this.radius*Math.cos(this.sweep),this.radius*Math.sin(this.sweep))
    ctx.restore()

    // // track curve origin
    // ctx.save()
    //   ctx.beginPath()
    //   ctx.arc(this.O.x,this.O.y,4,0,Math.PI*2)
    //   ctx.fillStyle='salmon'
    //   ctx.fill()
    //   ctx.beginPath()
    
    //   ctx.translate(this.O.x,this.O.y)
    //   ctx.rotate(this.O.a)
    //   ctx.moveTo(0,0)
    //   ctx.lineTo(25,0)
    //   ctx.strokeStyle='cyan'
    //   ctx.stroke()
    // ctx.restore()
  }
}

export class ParkingSpot{ 
  constructor(color,trackId) {
    this.color = color
    this.trackId = trackId
  }
  get track() {
    return this.network.tracks.get(this.trackId)
  }
  check(ctx) {
    const matchingCar = this.network.cars.get(this.color)
    let parked = matchingCar?.A.trackId == this.trackId
              && matchingCar?.B.trackId == this.trackId


    const dx = this.track.B.x-this.track.A.x,
          dy = this.track.B.y-this.track.A.y,
          length = Math.hypot(dx,dy),
          angle = Math.atan2(dy,dx)
    ctx.save()
    ctx.translate(this.track.A.x,this.track.A.y)
    ctx.rotate(angle)
    ctx.shadowBlur = 4
    ctx.shadowColor = parked?this.color:"black"
    ctx.lineWidth = 4
    ctx.setLineDash(parked?[]:[5])
    ctx.strokeStyle = parked?"white":this.color
    ctx.beginPath()
    ctx.roundRect(5,-20,length-10,40,10)
    ctx.stroke()
    ctx.restore()
  }

}