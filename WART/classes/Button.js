class Button {
  constructor(cx,cy,fn,text='',phase,key='',code,img='../me.png',w=64,h=64,r=8) {
    this.cx = cx
    this.cy = cy
    this.fn = fn
    this.key = key
    this.text = text
    this.phase = phase??text
    this.img = new Image()
    this.img.src = img
    this.w = w
    this.h = h
    this.r = r
    Game.buttons.push(this)
    if (code) Game.hotkeys[code]=this
  }
  get sx() {return innerWidth/2 + this.cx}
  get sy() {return innerHeight - this.cy}
  get x() {return this.sx - this.w/2}
  get y() {return this.sy - this.h/2}
  draw(ctx=CTX['gui']) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(this.x,this.y,this.w,this.h,this.r)
    if (ctx.isPointInPath(M.x,M.y)) {
      Game.hoverButton = this
      this.hover = true
    } else {
      this.hover = false
    }
    ctx.lineWidth = this.hover||Game.phase==this.phase?4:2
    ctx.fillStyle = this.hover||Game.phase==this.phase?'hsl(200 80 20)':'hsl(200 20 20)'
    ctx.fill()
    ctx.strokeStyle=Game.phase==this.phase?'hsl(50 80 50)':'hsl(200 20 80)'
    ctx.stroke()
    ctx.fillStyle='hsl(200 20 80)'
    ctx.fillText(this.text,this.sx,this.sy+this.h/4)
    ctx.drawImage(this.img,
      this.sx-this.h/4,
      this.sy-this.h/3,
      this.w/2,
      this.h/3,
    )
    ctx.fillStyle='hsl(200 20 80)'
    ctx.font = "bold 16px slate"
    ctx.fillText(this.key,this.sx,this.sy+this.h*3/4)
    ctx.restore()
  }
  click() {
    console.log(this)
    Game.phase=this.phase
    this.fn()
  }
}
