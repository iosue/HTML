class Meter {
  constructor(i,j,k) {
    this.i = i
    this.j = j
    this.k = k ?? Math.round(Math.random()*8)
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
    ctx.fill(this.path)
    ctx.strokeStyle='white'
    // ctx.stroke(this.path)
    ctx.font="32px consolas"
    ctx.fillStyle='hsl(40 20 80/0.6)'
    // ctx.fillText(`${this.j}:${this.i}`,this.x,this.y-16)
    // ctx.fillText(`${this.k}`,this.x,this.y+16)
    ctx.restore()
  }
  hover(ctx=CTX['map']) {
    if (ctx.isPointInPath(this.path,M.x,M.y)) {
      Game.hoverHex = this
      // ctx.save()
      // ctx.fillStyle='#fff2'
      // ctx.fill(this.path)
      // ctx.restore()

      // for (const [d,n] of this.neighbours) {
      //   ctx.save()
      //   ctx.font="32px consolas"
      //   ctx.fillStyle = 'cyan'
      //   ctx.fillText(d,n.x,n.y)
      //   ctx.restore()
      // }
    }
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
}
