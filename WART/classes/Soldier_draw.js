

Soldier.prototype.draw = function(ctx=CTX['pcs']) {

  if (Game.activePC==this && this.focus) {
    this.camTo()
  }

  ctx.save()
  ctx.translate(this.x,this.y)
  // if (Game.activePC==this) {
  //   if (Game.hoverHex) {
  //     if (Game.phase=='aim1'||Game.phase=='aim3'||this.pose=='shoot') this.aim()
  //     if (Game.phase=='move') this.showPathTo(Game.hoverHex)
  //   }
  // }

    if (this.focus) {
      ctx.beginPath()
      ctx.arc(0,0,.6**(2/3)*tileSize,0,Math.PI*2)
      ctx.fillStyle='#00f'
      ctx.fill()
    }

    if (this.done) {
      ctx.beginPath()
      ctx.arc(0,0,.5**(2/3)*tileSize,0,Math.PI*2)
      ctx.fillStyle='#f00'
      ctx.fill()
    }

    if (Game.activePC==this) {
      ctx.beginPath()
      ctx.arc(0,0,.4**(2/3)*tileSize,0,Math.PI*2)
      ctx.fillStyle='#fff8'
      ctx.fill()
    }


    ctx.rotate(this.facing)
    let i, s=17/32, feet=this.pose=='move'?'run':'idle'

    i=Math.floor((2*this.frame)%SpriteList['feet'][feet])
    ctx.drawImage(CVS[`${'feet'}_${feet}`],300*((i)%4), 200*Math.floor(i/4),300,200,-98*s,-60*s,300*s,200*s)

    i=Math.floor(this.frame%SpriteList[this.mode][this.pose])
    ctx.globalAlpha=1/1
    ctx.drawImage(CVS[`${this.mode}_${this.pose}`],300*(i%4), 200*Math.floor(i/4),300,200,-103*s,-120*s,300*s,200*s)
    ctx.globalAlpha=1

  // ctx.beginPath()
  // ctx.arc(0,0,.3**(2/3)*tileSize,0,Math.PI*2)
  // ctx.fillStyle='#fff4'
  // ctx.fill()

  // ctx.beginPath()
  // ctx.arc(0,0,1.3**(2/3)*tileSize,0,Math.PI*2)
  // ctx.fillStyle='#fff2'
  // ctx.fill()

  // ctx.beginPath()
  // ctx.arc(0,0,3.3**(2/3)*tileSize,0,Math.PI*2)
  // ctx.fillStyle='#fff2'
  // ctx.fill()

  // ctx.beginPath()
  // ctx.arc(0,0,100**(2/3)*tileSize,0,Math.PI*2)
  // ctx.clip()
  // ctx.fillStyle='#fff1'
  // ctx.fill()
  // ctx.lineWidth=12
  // ctx.setLineDash([tileSize/3])
  // ctx.strokeStyle='#fff2'
  // ctx.stroke()

  ctx.restore()
}


Soldier.prototype.drawPath = function(path,color) {
  let ctx=CTX['pth']
  ctx.save()
  ctx.beginPath()
  for (const step of path) {
    ctx.lineTo(step.tile.x,step.tile.y)
  }
  path[path.length-1]?.tile.outline(ctx,color)
  ctx.lineWidth=6
  ctx.strokeStyle=color
  ctx.stroke()
  ctx.restore()

  ctx=CTX['pcs']
  ctx.save()
  ctx.beginPath()
  ctx.font='16px consolas'
  if (path.length>1)
    path.reduce((a,b)=>{
      let x=(a.tile.x+b.tile.x)/2,
          y=(a.tile.y+b.tile.y)/2
      ctx.fillStyle='white'
      ctx.fillText(a.step/tileSize,x,y)
      ctx.fillStyle='black'
      ctx.fillText(Math.round(b.cost/tileSize),b.tile.x,b.tile.y)
      return b
    })
  ctx.restore()
}




Soldier.prototype.aim = function(target=Game.hoverHex,ctx=CTX['pth']) {
  if (Game.hoverHex===null) return
  console.log(target)
  let dx=target.x - this.x
  let dy=target.y - this.y
  let eDist=Math.hypot(dx,dy)
  let angle=Math.atan2(dy,dx)

  ctx.save()
  ctx.translate(this.x,this.y)
  let shift={x:100,y:17}
  ctx.rotate(this.facing=angle+Math.atan2(-shift.y,eDist-0*shift.x))
  ctx.translate(shift.x,shift.y)

  if (this.pose=='shoot') {
    ctx.beginPath()
    ctx.translate((this.frame-1/2)*(eDist-shift.x)/3,0)
    ctx.lineTo(0,0)
    ctx.lineTo((eDist-shift.x)/3,0)
    ctx.strokeStyle=`hsl(50 100 0)`
    ctx.lineWidth=4
    ctx.setLineDash([0])
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(0,0,Math.max(0,eDist-shift.x),-Weapons[this.mode].spread,Weapons[this.mode].spread)
    ctx.fillStyle='hsl(50 50 75/0.25)'
    ctx.lineTo(0,0)
    ctx.fill()

    ctx.beginPath()
    ctx.lineTo(0,0)
    ctx.lineTo(innerWidth+innerHeight,0)
    ctx.strokeStyle='hsl(50 50 75)'
    ctx.lineWidth=1
    ctx.setLineDash([tileSize/5])
    ctx.stroke()

    ctx.beginPath()
    ctx.lineTo(0,0)
    ctx.lineTo(eDist-shift.x,0)
    ctx.strokeStyle='hsl(50 75 50)'
    ctx.lineWidth=4
    ctx.setLineDash([0])
    ctx.stroke()
  }

  ctx.restore()
}




Soldier.prototype.drawGauge = function(ctx=CTX['gui']) {
  let width=15*20+4*20,
      bar=width/200

  ctx.save()
  ctx.strokeStyle="hsl(200 50 80/0.8)"

  ctx.fillStyle=`hsl(200 50 20/0.30)`
  ctx.translate(0,innerHeight)
  ctx.fillRect(0,0,innerWidth,-80)

  ctx.beginPath()
  ctx.rect(innerWidth/2-width/2-3,-75,width+6,40)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.rect(innerWidth/2-width/2-3,-30,width+6,15)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(innerWidth/2-width/2+bar*this.energy.datum,-75)
  ctx.lineTo(innerWidth/2-width/2+bar*this.energy.datum,-30)
  ctx.setLineDash([5,30])
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(innerWidth/2-width/2+bar*100,-30)
  ctx.lineTo(innerWidth/2-width/2+bar*100,-15)
  ctx.setLineDash([5,5])
  ctx.stroke()

  ctx.translate(innerWidth/2-width/2,-55)
  ctx.lineCap = "butt"
  ctx.setLineDash([0,2,15,2])

  // energy recommended to spend this round
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,0,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.datum,200),0)
  ctx.lineWidth = 34
  ctx.strokeStyle = `hsl(200 50 80/0.2)`
  ctx.stroke()

  // energy possible to spend this round
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.datum,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.max,200),0)
  ctx.lineWidth = 34
  ctx.strokeStyle = `hsl(100 50 80/0.2)`
  ctx.stroke()

  // energy already spend this round
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,0,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.spent,200),0)
  ctx.lineWidth = 28
  ctx.strokeStyle = `hsl(200 100 80)`
  ctx.stroke()

  // safe energy about to spend this turn
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.spent,this.energy.datum),0)
  ctx.lineTo(bar*Math.clamp(this.energy.spent,this.energy.total,this.energy.datum),0)
  ctx.lineWidth = 28
  ctx.strokeStyle = `hsl(100 100 80)`
  ctx.stroke()

  // extra energy about to spend this turn
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(this.energy.spent,this.energy.datum,200),0)
  ctx.lineTo(bar*Math.clamp(this.energy.datum,this.energy.total,this.energy.max),0)
  ctx.lineWidth = 28
  ctx.strokeStyle = `hsl(050 100 80)`
  ctx.stroke()

  // energy that exceeds possible
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(this.energy.max,this.energy.spent,200),0)
  ctx.lineTo(bar*Math.clamp(this.energy.max,this.energy.total,200),0)
  ctx.lineWidth = 28
  ctx.strokeStyle = `hsl(000 100 80)`
  ctx.stroke()




  ctx.translate(0,32.5)

  // standard possible next datum
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,0,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.regen,200),0)
  ctx.lineWidth=9
  ctx.strokeStyle="hsl(100 50 80/0.2)"
  ctx.stroke()


  // max possible next datum
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.regen,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.avail,200),0)
  ctx.lineWidth=9
  ctx.strokeStyle="hsl(200 50 80/0.2)"
  ctx.stroke()

  // potential bonus
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.regen,200),0)
  ctx.lineTo(bar*Math.clamp(this.energy.regen,this.energy.bonus,200),0)
  ctx.lineWidth=4
  ctx.strokeStyle="hsl(300 100 80)"
  ctx.stroke()

  // potential lost
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.taken,this.energy.regen),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.regen,200),0)
  ctx.lineWidth=4
  ctx.strokeStyle="hsl(050 100 20)"
  ctx.stroke()

  // next datum
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,0,200),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.taken,this.energy.regen),0)
  ctx.lineWidth=4
  ctx.strokeStyle="hsl(200 100 80)"
  ctx.stroke()

  ctx.restore()
}


Soldier.prototype._drawGauge = function(ctx=CTX['gui']) {

  let width=15*20+4*20,
      bar=width/200
  let prevEnergy=this.energy.prev

  this.energy.spent = 0
  this.energy.costs = Math.max(0,this.tentativePath.length-1)*10
  this.energy.total = this.energy.spent + this.energy.costs
  this.energy.burnt = 100+(100-this.energy.total)*(this.energy.total>100?2:1/2)
  this.energy.bankt = 100+(100-this.energy.total)*(this.energy.total>100?2:1/2)
  this.energy.datum = 100
  this.energy.maxim = 100+this.energy.datum/2

  ctx.save()
  ctx.strokeStyle="hsl(200 50 80/0.8)"

  ctx.fillStyle=`hsl(200 50 20/0.30)`
  ctx.translate(0,innerHeight)
  ctx.fillRect(0,0,innerWidth,-80)

  ctx.beginPath()
  ctx.rect(innerWidth/2-width/2-3,-75,width+6,40)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.rect(innerWidth/2-width/2-3,-30,width+6,15)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(innerWidth/2-width/2+bar*this.energy.datum,-75)
  ctx.lineTo(innerWidth/2-width/2+bar*this.energy.datum,-30)
  ctx.setLineDash([5,30])
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(innerWidth/2-width/2+bar*100,-30)
  ctx.lineTo(innerWidth/2-width/2+bar*100,-15)
  ctx.setLineDash([5,5])
  ctx.stroke()

  ctx.translate(innerWidth/2-width/2,-55)
  ctx.lineCap = "butt"
  ctx.setLineDash([0,2,15,2])

  ctx.beginPath()
  ctx.lineTo(0,0)
  ctx.lineTo(bar*this.energy.datum,0)
  ctx.lineWidth=32
  ctx.strokeStyle="hsl(200 50 80/0.2)"
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(bar*this.energy.datum,0)
  ctx.lineTo(bar*this.energy.maxim,0)
  ctx.lineWidth=32
  ctx.strokeStyle="hsl(100 50 80/0.2)"
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.maxim,200),0)
  ctx.lineTo(bar*Math.clamp(this.energy.maxim,this.energy.total,200),0)
  ctx.lineWidth=28
  ctx.strokeStyle="hsl(000 100 80)"
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(this.energy.datum,this.energy.datum,this.energy.datum),0)
  ctx.lineTo(bar*Math.clamp(this.energy.datum,this.energy.total,this.energy.maxim),0)
  ctx.lineWidth=28
  ctx.strokeStyle="hsl(050 100 80)"
  ctx.stroke()
  
  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,this.energy.spent),0)
  ctx.lineTo(bar*Math.clamp(this.energy.spent,this.energy.total,this.energy.datum),0)
  ctx.lineWidth=28
  ctx.strokeStyle="hsl(100 100 80)"
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(bar*Math.clamp(0,0,0),0)
  ctx.lineTo(bar*Math.clamp(0,this.energy.spent,this.energy.maxim),0)
  ctx.lineWidth=28
  ctx.strokeStyle="hsl(200 100 80)"
  ctx.stroke()



  ctx.translate(0,32.5)

  ctx.beginPath()
  ctx.lineTo(0,0)
  ctx.lineTo(bar*Math.clamp(0,100+this.energy.bankt/2),0)
  ctx.lineWidth=9
  ctx.strokeStyle="hsl(200 50 80/0.82)"
  ctx.stroke()

  // ctx.beginPath()
  // ctx.lineTo(bar*this.energy.bankt-2.5,0)
  // ctx.lineTo(bar*Math.max(0,this.energy.burnt)-2.5,0)
  // ctx.lineWidth=6
  // ctx.strokeStyle="hsl(50 50 80/0.82)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.lineTo(0,0)
  // ctx.lineTo(bar*Math.max(0,energyLost),0)
  // ctx.lineWidth=4
  // ctx.strokeStyle="hsl(100 80 80/0.5)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.lineTo(0,0)
  // ctx.lineTo(bar*Math.max(0,Math.min(energyLeft,energyLost)),0)
  // ctx.lineWidth=4
  // ctx.strokeStyle="hsl(200 80 80/0.5)"
  // ctx.stroke()

/*---------------------------------------------------*/

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*energyMax,0)
  // ctx.lineWidth=34
  // ctx.strokeStyle="hsl(200 50 80/0.2)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(bar*Math.min(200,energySpent),0)
  // ctx.lineTo(bar*Math.min(200,energySpent+energyPlanned),0)
  // ctx.lineWidth=28
  // ctx.strokeStyle="hsl(000 100 80/0.5)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*Math.min(energySpent+energyPlanned,energyMax),0)
  // ctx.lineWidth=28
  // ctx.strokeStyle="hsl(050 100 80/0.5)"
  // ctx.stroke()
  
  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*Math.min(100,energySpent+energyPlanned),0)
  // ctx.lineWidth=28
  // ctx.strokeStyle="hsl(100 100 80/0.5)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*this.energy.spent,0)
  // ctx.lineWidth=28
  // ctx.strokeStyle="hsl(200 100 80/0.5)"
  // ctx.stroke()



  // ctx.translate(0,32.5)

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*Math.max(0,Math.min(energyLeft,energyLost)),0)
  // ctx.lineWidth=9
  // ctx.strokeStyle="hsl(200 50 80/0.2)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(bar*energyLeft-2.5,0)
  // ctx.lineTo(bar*Math.max(0,energyLost)-2.5,0)
  // ctx.lineWidth=6
  // ctx.strokeStyle="hsl(50 50 80/0.2)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*Math.max(0,energyLost),0)
  // ctx.lineWidth=4
  // ctx.strokeStyle="hsl(100 80 80/0.5)"
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.moveTo(0,0)
  // ctx.lineTo(bar*Math.max(0,Math.min(energyLeft,energyLost)),0)
  // ctx.lineWidth=4
  // ctx.strokeStyle="hsl(200 80 80/0.5)"
  // ctx.stroke()

  ctx.restore()
}
