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
  switch(dir="in") {
    switch (dir) {
      case "in":{
        let tracks = [...this.in.values()]
        let i = tracks.indexOf(this.activeIn)
        let j = (i+1)%tracks.length
        this.activeIn = tracks[j]
      } break
      case "out":{
        let tracks = [...this.out.values()]
        let i = tracks.indexOf(this.activeOut)
        let j = (i+1)%tracks.length
        this.activeOut = tracks[j]
      } break
    }
  }

  redrawActiveTracks(ctx) {
    if (this.in.size>1) {
      this.activeIn ??= [...this.in.values()][0]
      this.activeIn.draw(ctx)
    }
    if (this.out.size>1) {
      this.activeOut ??= [...this.out.values()][0]
      this.activeOut.draw(ctx)
    }
  }

  draw(ctx,network) {
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

      ctx.globalAlpha=1.2

      ctx.lineWidth=4
      ctx.strokeStyle="#000"
      ctx.fillStyle="#fff"
      ctx.textAlign="center"
      ctx.textBaseline="middle"
      ctx.strokeText(this.id,0,0)
      ctx.fillText(this.id,0,0)
    ctx.restore()

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
      ctx.save()
      ctx.beginPath()
      ctx.arc(this.x,this.y,settings.clickRadius/2,0,Math.PI*2)
      ctx.lineWidth=4
      ctx.strokeStyle="#444"
      ctx.stroke()
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
  constructor(id, l=settings.standardLength, x=0, y=0, a=0) {
    super(id)
    this.id = id
    this.length=l
    const A = new Point(x, y, a, `${this.id}A`),
          B = new Point(
            x + l*Math.cos(a),
            y + l*Math.sin(a),
            a, `${this.id}B`
          )
    A.out.add(this)
    B.in.add(this)
    this.A = A
    this.B = B
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
        ctx.setLineDash([2,this.length/10 - 2])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(this.length,0)
        ctx.setLineDash([])
        ctx.lineCap = "round"
        ctx.strokeStyle='#666'
        ctx.lineWidth=settings.trackWidth
      ctx.stroke()

      // ctx.save()
      //   ctx.globalAlpha=1.5
      //   ctx.beginPath()
      //     ctx.moveTo(this.length/2-5+10,-10)
      //     ctx.lineTo(this.length/2+5+10,+0.)
      //     ctx.lineTo(this.length/2-5+10,+10)
      //     ctx.strokeStyle=this.length==100?'red':'orange'
      //     ctx.lineWidth=1
      //   ctx.stroke()

      //   ctx.lineWidth=2
      //   ctx.strokeStyle="#000"
      //   ctx.fillStyle="#ff8"
      //   ctx.textAlign="center"
      //   ctx.textBaseline="middle"
      //   ctx.strokeText(this.id, this.length/2, 0)
      //   ctx.fillText(this.id, this.length/2, 0)
      // ctx.restore()

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
  constructor(id, s=deg(30), r=settings.standardLength*2, x=0, y=0, a=deg(0)) {
    super(id)
    this.id = id
    this.radius=r
    this.sweep=(s=="L"?-1:1)*deg(30)
    this.A = new Point(x, y, a, `${this.id}A`)
    this.O = {
      x: x + r * Math.cos(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      y: y + r * Math.sin(a + (this.sweep>0 ? Math.PI/2 : -Math.PI/2)),
      a: a + (this.sweep<0 ? Math.PI/2 : -Math.PI/2)
    }
    this.B = new Point(
      this.O.x + r * Math.cos(this.O.a + this.sweep),
      this.O.y + r * Math.sin(this.O.a + this.sweep),
      a + this.sweep,
      `${this.id}B`
    )
    this.A.out.add(this)
    this.B.in.add(this)
		this.length = r * Math.abs(this.sweep)
	}

	recomputeGeometry() {
		const { x: startX, y: startY } = this.start
		const heading = this.heading
		const radius = this.radius
		const sweepAngle = this.sweepAngle

		const normalAngle = heading + (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
		this.center = {
			x: startX + radius * Math.cos(normalAngle),
			y: startY + radius * Math.sin(normalAngle),
		}

		this.startAngle = heading - (sweepAngle > 0 ? Math.PI / 2 : -Math.PI / 2)
		this.endAngle = this.startAngle + sweepAngle

		this.end = {
			x: this.center.x + radius * Math.cos(this.endAngle),
			y: this.center.y + radius * Math.sin(this.endAngle),
		}

		this.length = radius * Math.abs(sweepAngle)
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
        ctx.setLineDash([2,settings.standardLength*2*deg(30)/10-2])
        ctx.lineWidth=settings.trackWidth*2
      ctx.stroke()

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep,this.sweep<0)
        ctx.setLineDash([])
        ctx.lineCap = "round"
        ctx.lineWidth = settings.trackWidth
        ctx.strokeStyle = '#666'
      ctx.stroke()

      // ctx.globalAlpha=0.2
      // ctx.save()
      //   ctx.rotate(this.sweep/2)
      //   ctx.translate(this.radius,0)
      //   ctx.rotate(Math.PI/2+(this.sweep<0)*Math.PI)

      //   ctx.beginPath()
      //     ctx.moveTo(-5+10,-10)
      //     ctx.lineTo(+5+10,+0.)
      //     ctx.lineTo(-5+10,+10)
      //     ctx.strokeStyle='yellow'
      //     ctx.lineWidth=1
      //   ctx.stroke()

      //   ctx.lineWidth=2
      //   ctx.strokeStyle="#000"
      //   ctx.fillStyle="#f88"
      //   ctx.textAlign="center"
      //   ctx.textBaseline="middle"
      //   ctx.strokeText(this.id, 0, 0)
      //   ctx.fillText(this.id, 0, 0)
      // ctx.restore()

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