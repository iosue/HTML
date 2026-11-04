class ReservePool {
  constructor(color,q,r) {
    this.color = color
    this.x = (q==1?-canvasWidth*7/20:canvasWidth*21/20)-mapBorder
    this.y = ((r-1)*canvasHeight*7/20)-mapBorder
    this.units = []
    for (let i=0;i<15;i++) this.units.push(new BGEInfantry(color,this.x,this.y,true))
    for (let i=0;i<16;i++) this.units.push(new BTNInfantry(color,this.x,this.y,true))
    for (let i=0;i<17;i++) this.units.push(new COYInfantry(color,this.x,this.y,true))
    for (let i=0;i<12;i++) this.units.push(new COYCavalry(color,this.x,this.y,true))
    for (let i=0;i<16;i++) this.units.push(new COYArtillery(color,this.x,this.y,true))
    Game.units.push(...this.units)
    this.reorganizeUnits()
  }

  reorganizeUnits() {
    if (this.units.length) {
      let units={}, rows=1, topCols=0, coyCols=0
      this.units.forEach(unit=>{
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
  draw(ctx=CTX['map']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.beginPath()
    ctx.lineWidth=20
    ctx.rect(0,0,canvasWidth*6/20,canvasHeight*6/20)
    ctx.fillStyle='#444'
    ctx.fill()
    ctx.strokeStyle=ctx.isPointInPath(M.x,M.y)?'white':'black'
    ctx.stroke()
    ctx.lineWidth=10
    ctx.strokeStyle=this.color??'goldenrod'
    ctx.stroke()
    ctx.restore()
    // this.units.forEach(unit=>unit.draw(ctx))
  }
}