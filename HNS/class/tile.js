const gap=0

class Tile {
  constructor(i,j,type) {
    this.i = i
    this.j = j
    this.type = type
    this.w = settings.tile.width
    this.h = settings.tile.height
    this.W = settings.tile.width-settings.tile.edge
    this.H = settings.tile.height-settings.tile.edge
  }
  get x() {return this.i*this.w}
  get y() {return this.j*this.h}

  get top    () {return this.y-this.h/2+gap*0}
  get left   () {return this.x-this.w/2+gap*1}
  get right  () {return this.x+this.w/2-gap*1}
  get bottom () {return this.y+this.h/2-gap*0}

  get mTop    () {return this.y-this.H/2}
  get mLeft   () {return this.x-this.W/2+gap}
  get mRight  () {return this.x+this.W/2-gap}
  get mBottom () {return this.y+this.H/2}

  get traction(){return [0.1,1.5,.5,.5,1][this.type]}
  get friction(){return [0,2,.25,.25,1][this.type]/5}

  draw(ctx=CTX['bmp']) {
    ctx.save()
    ctx.globalAlpha=0.75
    ctx.fillStyle=[
      `hsl(210 50 50/0)`,
      `hsl(100 50 50)`,
      `hsl(200 50 30)`,
      `hsl(200 50 80)`,
      `hsl(050 50 50)`,
    ][this.type]
    ctx.strokeStyle="#00000001"
    ctx.translate(this.x,this.y)
    ctx.fillRect(-this.w/2,-this.H/2,this.w,this.H)
    ctx.fillRect(-this.W/2,-this.h/2,this.W,this.h)
    ctx.strokeRect(-this.w/2,-this.H/2,this.w,this.H)
    ctx.strokeRect(-this.W/2,-this.h/2,this.W,this.h)
    ctx.fillStyle="#ffffff01"
    ctx.fillText(`${this.i}:${this.j}`,0,0)
    ctx.restore()
  }
}
