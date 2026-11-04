class Tile {
  constructor(i,j,k,roads=[]) {
    this.i = i
    this.j = j
    this.k = Number(k) ?? Math.round(Math.random()*8)
    this.roads = roads
    this.units = []
  }
  get bonus() {return Number(' 412 3'[this.k])}
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
  reorderUnits() {
    if (this.units.length) {
      let units={}, rows=1, topCols=0, coyCols=0
      this.units.forEach(unit=>{
        unit.i = this.i
        unit.j = this.j
        units[unit.constructor.name] ??= []
        units[unit.constructor.name].push(unit)
      })

      if (
        (units.BGEInfantry||units.BTNInfantry||units.BTNDragoon) &&
        (units.COYInfantry||units.COYDragoon||units.COYCavalry||units.COYArtillery)
      ) rows++

      if (units.BGEInfantry)  topCols++
      if (units.BTNInfantry)  topCols++
      if (units.BTNDragoon)   topCols++
      if (units.COYInfantry)  coyCols++
      if (units.COYDragoon)   coyCols++
      if (units.COYCavalry)   coyCols++
      if (units.COYArtillery) coyCols++

      let col=0, stackShift=1/100
      for (const form of ["BTNInfantry","BGEInfantry","BTNDragoon"]) {
        if (units[form]) {
          let stack=0
          units[form].forEach(unit=>{
            unit.i-=stack++*stackShift+(topCols-1)/6-col/3
            unit.j-=stack++*stackShift+(rows>1?1/4:0)
          })
          col++
        }
      }
      col=0
      for (const form of ["COYInfantry","COYDragoon","COYCavalry","COYArtillery"]) {
        if (units[form]) {
          let stack=0
          units[form].forEach(unit=>{
            unit.i-=stack++*stackShift+(coyCols-1)/7.5-col/3.75
            unit.j-=stack++*stackShift-(rows>1?1/3.5:0)
            unit.draw()
          })
          col++
        }
      }
    }
  }
  drawUnits(ctx=CTX['pcs']) {
    if (this.units.length) {
      let units={}, rows=1, topCols=0, coyCols=0
      this.units.forEach(unit=>{
        units[unit.constructor.name] ??= []
        units[unit.constructor.name].push(unit)
      })

      for (const unit of this.units) unit.draw()
      for (const form of ["BTNInfantry","BGEInfantry","BTNDragoon","COYInfantry","COYDragoon","COYCavalry","COYArtillery"]) 
        if (units[form]?.length>1) showStackSize(units[form])
      function showStackSize(form) {
        ctx.save()
        ctx.translate(form[0].x,form[0].y)
        ctx.translate(form[0].size/2*.75-3,form[0].size/2*.75-1)
        ctx.beginPath()
        ctx.fillStyle='#444'
        ctx.arc(0,0,4,0,Math.PI*2)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle="#fff"
        ctx.scale(0.5,0.5)
        ctx.fillText(form.length,0,1)
        ctx.restore()
      }
    }
  }
  draw(ctx=CTX['bmp'],paint=false,reorder=false) {
    // this.checkHover()

    if (paint) {
      const colors=[
        'hsl(200 50 40)',
        'hsl(000 00 65)',
        'hsl(080 50 60)',
        'hsl(100 50 40)',
        undefined,
        'hsl(000 00 35)',
      ]
      ctx.save()
      ctx.fillStyle=`hsl(${100-this.k*5} 35 35)`
      ctx.fillStyle=colors[this.k]
      ctx.clip(this.path)
      ctx.fill(this.path)
      if (this.k==0) {
        ctx.save()
        ctx.translate(this.x,this.y)
        ctx.beginPath()
        for (const [d,n] of this.neighbours) {
          if (n.k>0) {
            ctx.save()
            ctx.rotate(Math.PI*{dn:0,ne:1,se:2,ds:3,sw:4,nw:5}[d]/3)
            ctx.moveTo(-this.w/4,-this.h/2)
            ctx.lineTo(+this.w/4,-this.h/2)
            ctx.restore()
          }
        }
        ctx.lineWidth=30
        ctx.strokeStyle="hsl(50 50 80)"
        ctx.stroke()
        ctx.lineWidth=24
        ctx.strokeStyle="hsl(50 50 90)"
        ctx.stroke()
        ctx.restore()
      } else this.drawBonus(ctx)
      ctx.lineWidth=6
      ctx.strokeStyle='black'
      ctx.stroke(this.path)
  
      this.drawRoads(ctx)
  
      // this.drawCoords(ctx)
  
      this.drawCities(ctx)


  
      ctx.restore()
    }

    // if (Game.hovered.tile==this) {
    //   this.highlight(CTX['pth'],'hsl(0 0 100)')
    // }

    if (reorder) {
      this.reorderUnits()
    // } else {
    //   this.drawUnits()
    }
  }

  drawBonus(ctx=CTX['bmp']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.translate(tileSize/5,tileSize/2.85)
    ctx.beginPath()
    ctx.roundRect(-tileSize/20,-tileSize/20,tileSize/10,tileSize/10,tileSize/40)
    ctx.fillStyle='#4444'
    ctx.fill()
    ctx.lineWidth=1
    ctx.stroke()
    ctx.font=`${tileSize/12}px consolas`
    ctx.fillStyle="#fff"
    ctx.fillText(this.bonus,0,1)
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
  checkHover(ctx=CTX['map']) {
    if (Game.hovered.tile===null) return
    if (ctx.isPointInPath(this.path,M.x,M.y)) {
      Game.hovered.tile = this
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
      if (Game.terrain[i]?.[j]) nList[dir]=Game.terrain[i][j]
    }
    test('dn',this.i-0,this.j-2)
    test('ne',this.i+1,this.j-1)
    test('se',this.i+1,this.j+1)
    test('ds',this.i+0,this.j+2)
    test('sw',this.i-1,this.j+1)
    test('nw',this.i-1,this.j-1)
    return Object.entries(nList)
  }
  pathTo(goal) {
    
  }
}
