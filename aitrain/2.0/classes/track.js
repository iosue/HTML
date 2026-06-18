import * as settings from '../defaults.js'
import { deg, normalizeAngle } from '../helpers.js'

export class Point {
  constructor(x=0, y=0, a=deg(10), id=crypto.randomUUID()) {
    this.id = id
    this.in=new Set()
    this.out=new Set()
    this.x = x
    this.y = y
    this.a = a
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

  switch(dir="in") {
    let tracks = [...this[dir].values()]
    let occupiedTrack = tracks.reduce((a,b)=>a||b.occupied?b:0,false)
    if (occupiedTrack)
      return console.warn(this.id,dir,'occupied on',occupiedTrack.id)
    let i = tracks.indexOf(this[{in:"activeIn",out:"activeOut"}[dir]])
    let j = (i+1)%tracks.length
    this[{in:"activeIn",out:"activeOut"}[dir]] = tracks[j]
  }

  redrawActiveTracks(ctx) {
    if (this.in.size>1) {
      this.activeIn ??= [...this.in.values()][0]
      this.activeIn.track.draw(ctx)
    }
    if (this.out.size>1) {
      this.activeOut ??= [...this.out.values()][0]
      this.activeOut.track.draw(ctx)
    }
  }

  draw(ctx,network) {
    if (this.in.size>1) {
      if (network.hoveredPoint?.[0] == this && network.hoveredPoint?.[1] == "in") {
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
        ctx.strokeStyle="goldenrod"
        ctx.stroke()
        ctx.restore()
      }
    }
    if (this.out.size>1) {
      if (network.hoveredPoint?.[0] == this && network.hoveredPoint?.[1] == "out") {
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
        ctx.strokeStyle="yellowgreen"
        ctx.stroke()
        ctx.restore()
      }
    }
    if (this.in.size<=1 && this.out.size<=1) {
      // ctx.save()
      // ctx.beginPath()
      // ctx.arc(this.x,this.y,settings.clickRadius*1/4,0,Math.PI*2)
      // ctx.lineWidth=4
      // ctx.fillStyle="#281f18"
      // ctx.fill()
      // ctx.restore()
      ctx.save()
      ctx.beginPath()
      ctx.translate(this.x,this.y)
      ctx.rotate(this.a)
      ctx.moveTo(0,-settings.clickRadius*1.5/2)
      ctx.lineTo(0,+settings.clickRadius*1.5/2)
      ctx.lineWidth = 2
      ctx.strokeStyle = "#864"
      ctx.stroke()
      ctx.restore()
    }
    if (settings.showLabels) {
      ctx.save()
      ctx.fillStyle = ctx.strokeStyle = 
          this.in.size==0 ? "salmon" :
          this.in.size==2 ? "cyan" : "grey"
        ctx.translate(this.x,this.y)
        ctx.rotate(this.a)
        ctx.beginPath()
          ctx.arc(0,0,3,0,Math.PI*2)
          ctx.moveTo(0,-9)
          ctx.lineTo(0,+9)
        ctx.stroke()
      ctx.fillStyle = ctx.strokeStyle = 
          this.out.size==0 ? "salmon" :
          this.out.size==2 ? "cyan" : "grey"
        ctx.beginPath()
          ctx.arc(0,0,6,Math.PI*3/2,Math.PI*1/2)
        ctx.stroke()

        ctx.rotate(-Math.PI/2)
        ctx.lineWidth=4
        ctx.strokeStyle="#000"
        ctx.fillStyle="cyan"
        ctx.textAlign="center"
        ctx.textBaseline="middle"
        ctx.strokeText(this.id,0,0)
        ctx.fillText(this.id,0,0)
      ctx.restore()
    }

    if (this.in.size==0 || this.out.size==0) {
      ctx.save()
      ctx.textAlign="center"
      ctx.textBaseline="middle"
        ctx.save()
          ctx.translate(this.x,this.y)
          ctx.rotate(this.a)
          ctx.beginPath()
            ctx.arc(0,0,settings.clickRadius,0,Math.PI*2)
            ctx.strokeStyle="red"
          ctx.stroke()
        ctx.restore()
        if (this.in.size==0) {
          ctx.save()
            ctx.translate(this.x,this.y)
            ctx.rotate(this.a)
            ctx.beginPath()
              ctx.fillStyle='red'
              ctx.fillText('IN = 0',0,-24)
          ctx.restore()
        }
        if (this.out.size==0) {
          ctx.save()
            ctx.translate(this.x,this.y)
            ctx.rotate(this.a)
            ctx.beginPath()
              ctx.fillStyle='red'
              ctx.fillText('OUT = 0',0,+24)
          ctx.restore()
        }
      ctx.restore()
    }
  }
}

export class Track {
  constructor(id=crypto.randomUUID()) {
    this.id = id
    this.reverse=false
  }
}

export class StraightTrack extends Track {
  constructor(id, sw=false, l=settings.standardLength, x=0, y=0, a=0) {
    super(id)
    this.id = id
    this.switch = sw
    this.length = l
    this.A = new Point(x, y, a, `${this.id}-A`),
    this.B = new Point(
            x + this.length*Math.cos(a),
            y + this.length*Math.sin(a),
            a, `${this.id}-B`
          )
    this.A.out.add({track:this, end:'A', reverse:false})
    this.B.in.add({track:this, end:'B', reverse:false})
  }

  posAt(t) {
    return {
      x: this.A.x + this.length * t * Math.cos(this.A.a),
      y: this.A.y + this.length * t * Math.sin(this.A.a),
      a: this.A.a || this.B.a,
    }
  }

  setA(point, merge=false) {
    this.A = point
    this.reverse = Boolean(merge)
    const angle = normalizeAngle(point.a + this.reverse*Math.PI)
    this.B.x = point.x + this.length * Math.cos(angle)
    this.B.y = point.y + this.length * Math.sin(angle)
    this.B.a = angle
  }
  setB(point, merge=false) {
    this.B = point
    // this.reverse = !Boolean(merge)
    const angle = normalizeAngle(point.a + !merge*Math.PI)
    this.A.x = point.x - this.length * Math.cos(angle)
    this.A.y = point.y - this.length * Math.sin(angle)
    this.A.a = angle
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
        // ctx.setLineDash([2,this.length/10 - 2])
        ctx.setLineDash([1,this.length/10 - 2,1,0])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.setLineDash([])
        ctx.lineCap = settings.trackLineCap
        ctx.strokeStyle=this.switch?'#6aa':'#666'
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
    ctx.save()
      ctx.lineTo(this.B.x,this.B.y)
      ctx.setLineDash([2])
      ctx.strokeStyle = "goldenrod"
      ctx.stroke()

    ctx.restore()
  }
}


export class CurvedTrack extends Track {
  constructor(id, s='L', sw=false, r=settings.standardLength*2, x=0, y=0, a=deg(0)) {
    super(id)
    this.id = id
    this.switch = sw
    this.radius = r
    this.sweep = (s=="L"?-1:1)*deg(30)
    this.A = new Point(x, y, a, `${this.id}-A`)
    this.O = {
      x: x + r * Math.cos(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      y: y + r * Math.sin(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      a: a + (this.sweep<0 ? Math.PI/2 : -Math.PI/2)
    }
    this.B = new Point(
      this.O.x + r * Math.cos(this.O.a + this.sweep),
      this.O.y + r * Math.sin(this.O.a + this.sweep),
      a + this.sweep,
      `${this.id}-B`
    )
    this.A.out.add({track:this, end:'A', reverse:false})
    this.B.in.add({track:this, end:'B', reverse:false})
		this.length = r * Math.abs(this.sweep)
	}

  posAt(t) {
    return {
      x: this.O.x + this.radius * Math.cos(this.O.a + this.sweep * t),
      y: this.O.y + this.radius * Math.sin(this.O.a + this.sweep * t),
      a: this.O.a + (this.sweep>0?1:-1)*Math.PI/2 + this.sweep * t
    }
  }


  setA(point, merge=false) {
    this.A = point
    this.reverse = Boolean(merge)

    const angle = normalizeAngle(point.a + this.reverse*Math.PI)

    this.O.x = point.x + this.radius * Math.cos(angle + (this.sweep>0 ? Math.PI/2 : -Math.PI/2))
    this.O.y = point.y + this.radius * Math.sin(angle + (this.sweep>0 ? Math.PI/2 : -Math.PI/2))
    this.O.a = normalizeAngle(angle + (this.sweep<0 ? Math.PI/2 : -Math.PI/2))

    this.B.x = this.O.x + this.radius * Math.cos(this.O.a + this.sweep)
    this.B.y = this.O.y + this.radius * Math.sin(this.O.a + this.sweep)
    this.B.a = normalizeAngle(point.a + this.sweep + Math.PI*this.reverse)
  }
  setB(point, merge=false) {
    this.B = point
    this.reverse = Boolean(merge)
    const angle = normalizeAngle(point.a + !this.reverse*Math.PI + (this.sweep>0 ? Math.PI/2 : -Math.PI/2))

    this.O.x = point.x + this.radius * Math.cos(angle)
    this.O.y = point.y + this.radius * Math.sin(angle)
    this.O.a = normalizeAngle(angle - this.sweep + (!this.reverse?-1:1)*(this.sweep>0 ? Math.PI : -Math.PI))

    this.A.x = this.O.x + this.radius * Math.cos(this.O.a)
    this.A.y = this.O.y + this.radius * Math.sin(this.O.a)
    this.A.a = normalizeAngle(point.a - 1*this.sweep + Math.PI*!this.reverse)
  }

  draw(ctx) {
    ctx.save()
      ctx.translate(this.O.x,this.O.y)
      ctx.rotate(normalizeAngle(this.O.a + 0*this.reverse*Math.PI))

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#000'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*4
      ctx.stroke()

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#281f18'
        ctx.setLineDash([])
        ctx.lineWidth=settings.trackWidth*3
      ctx.stroke()

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.strokeStyle='#864'
        // ctx.setLineDash([2,settings.standardLength*2*deg(30)/10-2])
        ctx.setLineDash([1,settings.standardLength*2*deg(30)/10-2,1,0])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.setLineDash([])
        ctx.lineCap = settings.trackLineCap
        ctx.lineWidth = settings.trackWidth
        ctx.strokeStyle=this.switch?'#6aa':'#666'
      ctx.stroke()

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

      ctx.beginPath()
      ctx.moveTo(this.radius*Math.cos(this.sweep),this.radius*Math.sin(this.sweep))
    ctx.restore()
    ctx.save()
      ctx.lineTo(this.B.x,this.B.y)
      ctx.setLineDash([3]);
      ctx.strokeStyle = "goldenrod"
      ctx.stroke()
    ctx.restore()


    // ctx.save()
    //   // console.log(this.O)
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