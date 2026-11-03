class Meter {
  constructor(i,j,k,roads=[]) {
    this.i = i
    this.j = j
    this.k = Number(k) ?? Math.round(Math.random()*8)
    this.roads = roads
  }
  get h() {return tileSize}
  get w() {return this.h/Math.cos(Math.PI/6)}
  get x() {return this.i*this.w*3/4}
  get y() {return (this.j/2)*this.h}
  get z() {return this.k}
  get path() {
    let ctx = new Path2D()
    ctx.lineTo(this.x+this.w/2,this.y+this.h*0)
    ctx.lineTo(this.x+this.w/4,this.y+this.h/2)
    ctx.lineTo(this.x-this.w/4,this.y+this.h/2)
    ctx.lineTo(this.x-this.w/2,this.y-this.h*0)
    ctx.lineTo(this.x-this.w/4,this.y-this.h/2)
    ctx.lineTo(this.x+this.w/4,this.y-this.h/2)
    ctx.closePath()
    return ctx
  }
  draw(ctx=CTX['bmp']) {
    const colors=[
      'hsl(200 50 40)',
      'hsl(000 00 65)',
      'hsl(080 50 60)',
      'hsl(100 50 40)',
      'black',
      'hsl(000 00 35)',
    ]
    ctx.save()
    ctx.fillStyle=`hsl(${100-this.k*5} 35 35)`
    ctx.fillStyle=colors[this.k]
    ctx.clip(this.path)
    ctx.fill(this.path)
    ctx.lineWidth=6
    ctx.strokeStyle='black'
    ctx.stroke(this.path)

    this.drawRoads(ctx)

    this.drawCoords(ctx)

    this.drawCities(ctx)

    ctx.restore()
  }
  drawRoads(ctx=CTX['bmp']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.rotate(-Math.PI/2)
    ctx.beginPath()
    for (let d of this.roads) {
      ctx.save()
      ctx.moveTo(0,0)
      ctx.rotate(d*Math.PI/3)
      ctx.lineTo(this.w/2,0)
      ctx.restore()
    }
    ctx.lineWidth = tileSize/10
    ctx.strokeStyle='hsl(000 00 00)'
    ctx.stroke()
    ctx.lineWidth = tileSize/12
    ctx.strokeStyle='hsl(000 00 65)'
    ctx.stroke()
    
    ctx.restore()
  }
  drawCoords(ctx=CTX['bmp']) {
    ctx.save()
    ctx.font=`${tileSize/5}px consolas`
    ctx.translate(this.x,this.y)
    ctx.fillStyle='hsl(40 20 0)'
    ctx.fillText(`${this.i}:${this.j}`,0,-20)
    ctx.fillText(`${this.k}`,0,+20)
    ctx.restore()
  }
  drawCities(ctx=CTX['bmp']) {
    if (this.name) {
      ctx.save()
      ctx.translate(this.x,this.y)
      ctx.lineWidth=tileSize/20
      ctx.strokeStyle='hsl(50 100 10)'
      ctx.strokeText(`${this.name}`,0,0)
      ctx.fillStyle='hsl(50 100 90)'
      ctx.fillText(`${this.name}`,0,0)
      ctx.restore()
    }
  }
  hover(ctx=CTX['map']) {
    if (Game.hoverHex===null) return
    if (ctx.isPointInPath(this.path,M.x,M.y)) {
      Game.hoverHex = this
      this.highlight(CTX['pth'],'hsl(0 0 100)')
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
    ctx.rotate(Math.PI/2)
    ctx.lineWidth=7
    ctx.strokeStyle=color
    ctx.stroke(notched)
    
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
