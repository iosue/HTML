import { deg, normalizeAngle } from '../helpers.js'

export class Point {
  constructor(x=0,y=0,a=deg(10),id=crypto.randomUUID()) {
    if (id) {
      console.log(arguments)
    }
    this.id = id
    this.in=new Set()
    this.out=new Set()
    this.x = x
    this.y = y
    this.a = a
  }
  draw(ctx) {
    ctx.save()
    ctx.fillStyle = ctx.strokeStyle = "#888"
      ctx.translate(this.x,this.y)
      ctx.rotate(this.a)
      ctx.beginPath()
        ctx.arc(0,0,3,0,Math.PI*2)
        ctx.moveTo(0,-9)
        ctx.lineTo(0,+9)
      ctx.stroke()
      ctx.beginPath()
        ctx.arc(0,0,6,Math.PI*3/2,Math.PI*1/2)
      ctx.stroke()

      ctx.lineWidth=2
      ctx.strokeStyle="#000"
      ctx.fillStyle="#88f"
      ctx.textAlign="center"
      ctx.textBaseline="middle"
      ctx.strokeText(this.id,0,0)
      ctx.fillText(this.id,0,0)
    ctx.restore()
  }
}

export class Track {
  constructor(id=crypto.randomUUID()) {
    this.id = id
    this.reverse=false
  }
}

export class StraightTrack extends Track {
  constructor(id,x=0,y=0,a=0,l=100) {
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
        ctx.strokeStyle='#666'
        ctx.lineWidth=4
      ctx.stroke()

      ctx.beginPath()
        ctx.moveTo(this.length/2-5+10,-10)
        ctx.lineTo(this.length/2+5+10,+0.)
        ctx.lineTo(this.length/2-5+10,+10)
        ctx.strokeStyle='red'
        ctx.lineWidth=1
      ctx.stroke()

      ctx.lineWidth=2
      ctx.strokeStyle="#000"
      ctx.fillStyle="#f88"
      ctx.textAlign="center"
      ctx.textBaseline="middle"
      ctx.strokeText(this.id, this.length/2, 0)
      ctx.fillText(this.id, this.length/2, 0)
    ctx.restore()
  }
}


export class CurvedTrack extends Track {
  constructor(id, x=0, y=0, a=deg(0), s=deg(20), r=100) {
    super(id)
    this.id = id
    this.radius=r
    this.sweep=s
    this.A = new Point(x, y, a, `${this.id}A`)
    this.O = {
      x: x + r * Math.cos(a + (s>0 ? Math.PI/2 : -Math.PI/2)),
      y: y + r * Math.sin(a + (s>0 ? Math.PI/2 : -Math.PI/2)),
      a: a + (s<0 ? Math.PI/2 : -Math.PI/2)
    }
    this.B = new Point(
      this.O.x + r * Math.cos(this.O.a + s),
      this.O.y + r * Math.sin(this.O.a + s),
      a + s,
      `${this.id}B`
    )
    this.A.out.add(this)
    this.B.in.add(this)
		this.length = r * Math.abs(s)
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

  resetA(point) {
    this.A = point
    this.B.x = point.x + this.length * Math.cos(point.a)
    this.B.y = point.y + this.length * Math.sin(point.a)
    this.B.a = a
  }

  draw(ctx) {
    // ctx.save()
    //   console.log(this.O)
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

    ctx.save()
      ctx.translate(this.O.x,this.O.y)
      ctx.rotate(normalizeAngle(this.O.a))

      ctx.beginPath()
        ctx.arc(0,0,this.radius,0,this.sweep)
        ctx.strokeStyle='#666'
        ctx.lineWidth=4
      ctx.stroke()

      ctx.rotate(this.sweep/2)
      ctx.translate(this.radius,0)
      ctx.rotate(Math.PI/2)

      ctx.beginPath()
        ctx.moveTo(-5+10,-10)
        ctx.lineTo(+5+10,+0.)
        ctx.lineTo(-5+10,+10)
        ctx.strokeStyle='orange'
        ctx.lineWidth=1
      ctx.stroke()

      ctx.lineWidth=2
      ctx.strokeStyle="#000"
      ctx.fillStyle="#f88"
      ctx.textAlign="center"
      ctx.textBaseline="middle"
      ctx.strokeText(this.id, 0, 0)
      ctx.fillText(this.id, 0, 0)
    ctx.restore()
  }
}