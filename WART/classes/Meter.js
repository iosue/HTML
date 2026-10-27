class Meter {
  constructor(i,j,k) {
    this.i = i
    this.j = j
    this.k = Number(k) ?? Math.round(Math.random()*8)
  }
  get w() {return tileSize}
  get h() {return this.w/Math.cos(Math.PI/6)}
  get x() {return (this.i/2)*this.w}
  get y() {return this.j*this.h*3/4 - 0*this.k*4}
  get z() {return this.k}
  get path() {
    let ctx = new Path2D()
    ctx.lineTo(this.x+this.w*0,this.y-this.h/2)
    ctx.lineTo(this.x+this.w/2,this.y-this.h/4)
    ctx.lineTo(this.x+this.w/2,this.y+this.h/4)
    ctx.lineTo(this.x+this.w*0,this.y+this.h/2)
    ctx.lineTo(this.x-this.w/2,this.y+this.h/4)
    ctx.lineTo(this.x-this.w/2,this.y-this.h/4)
    ctx.closePath()
    return ctx
  }
  draw(ctx=CTX['bmp']) {
    ctx.save()
    ctx.fillStyle=`hsl(${100-this.k*5} 35 35)`
    ctx.fillStyle=[
      'hsl(200 50 50/0.5)',
      'hsl(000 00 65/0.5)',
      'hsl(080 50 60/0.5)',
      'hsl(100 50 40/0.5)',
      'black',
      'hsl(000 00 35/0.5)',
    ][this.k]
    ctx.fill(this.path)
    // ctx.font="32px consolas"
    // ctx.fillStyle='hsl(40 20 80/0.6)'
    // ctx.fillText(`${this.j}:${this.i}`,this.x,this.y-16)
    // ctx.fillText(`${this.k}`,this.x,this.y+16)
    ctx.restore()
  }
  hover(ctx=CTX['map']) {
    if (Game.hoverHex===null) return
    if (ctx.isPointInPath(this.path,M.x,M.y)) {
      Game.hoverHex = this
      this.highlight(CTX['pth'],'hsl(0 0 100/0.5)')
    }
  }
  highlight(ctx=CTX['pth'],color='cyan') {
    ctx.save()
    let notched = new Path2D()
    let f=6, steps=6*f, dΘ = Math.PI*2/steps
    for (let s=0;s<=steps;s++) {
      let Θ=s*dΘ,
          r=this.w/2.28 * (3**0.5)/(2*Math.sin(Θ+Math.PI/3-Math.PI/3*Math.floor(3*Θ/Math.PI)))
      if (s%f>1)
        notched.moveTo(r*Math.sin(Θ),r*Math.cos(Θ))
      else
        notched.lineTo(r*Math.sin(Θ),r*Math.cos(Θ))
    }
    ctx.translate(this.x,this.y)
    ctx.lineWidth=7
    ctx.strokeStyle=color
    ctx.stroke(notched)
    
    ctx.font="20px consolas"
    ctx.fillStyle='hsl(40 20 80/0.6)'
    ctx.fillText(`${this.j}:${this.i}`,0,-12)
    ctx.fillText(`${this.k}`,0,+16)
    ctx.restore()
  }
  outline(ctx=CTX['pth'],color='cyan') {
    ctx.save()
    ctx.lineWidth=9
    ctx.strokeStyle=color
    ctx.clip(this.path)
    ctx.stroke(this.path)
    ctx.restore()
  }
  get neighbours() {
    let nList={}
    function test(dir,i,j) {
      if (Game.terrain[j]?.[i]) nList[dir]=Game.terrain[j][i]
    }
    test('nw',this.i-1,this.j-1)
    test('ne',this.i+1,this.j-1)
    test('dw',this.i-2,this.j+0)
    test('de',this.i+2,this.j+0)
    test('sw',this.i-1,this.j+1)
    test('se',this.i+1,this.j+1)
    return Object.entries(nList)
  }
  pathTo(goal) {
    
  }
}
