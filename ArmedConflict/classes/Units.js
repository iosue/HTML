class Unit {
  constructor(color,i,j,reserve=false) {
    this.color = color
    this.i = i
    this.j = j
    this.reserve = reserve
    if (Game.terrain[i]?.[j]) Game.terrain[i][j].units.push(this)
  }
  get x() {return this.reserve?this.i:this.i*tileSize/Math.cos(Math.PI/6)*3/4}
  get y() {return this.reserve?this.j:(this.j/2)*tileSize}
  get token() {
    let ctx=new Path2D()
    let width=this.size,
        height=this.size
    ctx.rect(-width/2,-height/2,width,height)
    return ctx
  }
  get path() {
    let ctx=new Path2D()
    let width=this.size/1.5,
        height=this.size/3
    ctx.rect(-width/2,-height/2,width,height)
    return ctx
  }
  draw(ctx=CTX['pcs']) {
    // this.checkHover()
    ctx.save()

    ctx.translate(this.x,this.y)
    ctx.scale(0.75,0.75)
    ctx.lineWidth=tileSize/100

    if (Game.hovered.unit==this) {
      ctx.save()
        ctx.translate(0.75,0.75)
        ctx.lineWidth=12
        ctx.strokeStyle="#0002"
        ctx.stroke(this.token)
      ctx.restore()
      ctx.save()
        ctx.lineWidth=10
        ctx.strokeStyle='goldenrod'
        ctx.stroke(this.token)
      ctx.restore()
    } else {
      ctx.save()
        ctx.translate(0.75,0.75)
        ctx.lineWidth=4
        ctx.strokeStyle="#0002"
        ctx.stroke(this.token)
      ctx.restore()
    }

    // token
    ctx.save()
      ctx.fillStyle=this.color
      ctx.fill(this.token)
      ctx.strokeStyle="black"
      ctx.stroke(this.token)
    ctx.restore()

    //nato
    ctx.save()
      ctx.beginPath()
      ctx.fillStyle="white"
      ctx.fill(this.path)
      ctx.strokeStyle="black"
      ctx.stroke(this.path)
    ctx.restore()

    //size
    ctx.save()
      ctx.translate(0,-this.size/3.5)
      ctx.beginPath()
      ctx.font=`${this.size/5}px consolas`
      ctx.fillStyle=(this.color[4]==0)?'white':'black'
      ctx.fillText(this.symbol,0,0)
    ctx.restore()

    //field-field movement
    ctx.save()
      ctx.translate(-this.size/4.5,-this.size/3.5)
      ctx.beginPath()
      if (this.fieldMove==1) {
        ctx.arc(0,0,2,0,Math.PI*2)
      } else if (this.fieldMove==2) {
        ctx.arc(-3,0,2,0,Math.PI*2)
        ctx.arc(+4,0,2,0,Math.PI*2)
      }
      ctx.strokeStyle='black'
      ctx.fillStyle='hsl(080 50 60)',
      ctx.stroke()
      ctx.fill()
    ctx.restore()

    //other terrain movement
    ctx.save()
      ctx.translate(+this.size/4.5,-this.size/3.5)
      ctx.beginPath()
      if (this.crossCountry) {
        ctx.arc(0,0,2,0,Math.PI*2)
      }
      ctx.strokeStyle='black'
      ctx.fillStyle='hsl(080 0 60)',
      ctx.stroke()
      ctx.fill()
    ctx.restore()

    //indirect fire range
    ctx.save()
      ctx.translate(-this.size/4,+this.size/6)
      ctx.beginPath()
      if (this.iRange==1) {
        ctx.moveTo(-1.5,3)
        ctx.lineTo(+1.5,3)
      } else if (this.iRange==2) {
        ctx.moveTo(-3.5,3)
        ctx.lineTo(-1.5,3)
        ctx.moveTo(+1.5,3)
        ctx.lineTo(+3.5,3)
      }
      ctx.strokeStyle=(this.color[4]==0)?'white':'black'
      ctx.fillStyle='hsl(080 50 60)',
      ctx.stroke()
      ctx.fill()
    ctx.restore()

    //indirect fire dice
    if (this.iDie) {
      ctx.save()
        ctx.translate(-this.size/4,+this.size/6)
        ctx.beginPath()
        ctx.arc(0,8,2,0,Math.PI*2)
        ctx.strokeStyle='black'
        ctx.fillStyle=this.iDie,
        ctx.stroke()
        ctx.fill()
      ctx.restore()
    }


    //direct fire dice
    ctx.save()
      ctx.translate(+this.size/4,+this.size/6)
      if (Object.keys(this.attack).length>1) ctx.translate(-3,0)
      for (const dice in this.attack) {
        ctx.save()
        if (this.attack[dice]>1) ctx.translate(0,-3)
        for (let i=0;i<this.attack[dice];i++) {
          ctx.beginPath()
          ctx.arc(0,8,2,0,Math.PI*2)
          ctx.strokeStyle='black'
          ctx.fillStyle=dice,
          ctx.stroke()
          ctx.fill()
          ctx.translate(0,7)
        }
        ctx.restore()
        ctx.translate(7,0)
      }
    ctx.restore()


    //armour
    ctx.save()
      ctx.translate(0,+this.size/6+9)
      ctx.beginPath()
      ctx.roundRect(-5,-6,10,10,3)
      ctx.stroke()
      ctx.fillStyle="#bbb"
      ctx.fill()
      ctx.fillStyle="#000"
      ctx.fillText(this.armour,0,0)
    ctx.restore()

    ctx.stroke(this.icon)

    //////////////////////
    ctx.restore()
  }
  get icon() {
    let ctx=new Path2D()
    let width=this.size/1.5,
        height=this.size/3
    if (this.type=='infantry'||this.type=='dragoon') {
      ctx.moveTo(-width/2,-height/2)
      ctx.lineTo(+width/2,+height/2)
      ctx.moveTo(-width/2,+height/2)
      ctx.lineTo(+width/2,-height/2)
    }
    if (this.type=='cavalry'||this.type=='dragoon') {
      let w=width/5, h=height/4
      ctx.moveTo(-w,-h)
      ctx.arc(+w,0,h,-Math.PI/2,+Math.PI/2)
      ctx.arc(-w,0,h,+Math.PI/2,-Math.PI/2)
    }
    if (this.type=='artillery') {
      ctx.arc(0,0,1,0,Math.PI*2)
    }
    return ctx
  }

  checkHover(ctx=CTX['pcs']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.scale(0.75,0.75)
    if (ctx.isPointInPath(this.token,M.x,M.y)) {
      Game.hovered.unit = this
    }
    ctx.restore()
  }

}

const BGE=tileSize/3.0,
      BTN=tileSize/3.5,
      COY=tileSize/4.0

class BGEInfantry extends Unit {
  armour=6
  attack = {
    'hsl(100 50 50)': 2,
    'hsl(000 50 50)': 2,
  }
  crossCountry=true
  fieldMove=1
  iDie=null
  iRange=0
  size=BGE
  symbol="X"
  type='infantry'
}

class BTNInfantry extends Unit {
  armour=5
  attack = {
    'hsl(100 50 50)': 1,
    'hsl(000 50 50)': 1,
  }
  crossCountry=true
  fieldMove=1
  iDie=null
  iRange=0
  size=BTN
  symbol="||"
  type='infantry'
}

class COYInfantry extends Unit {
  armour=2
  attack = {
    'hsl(100 50 50)': 1,
  }
  crossCountry=true
  fieldMove=1
  iDie=null
  iRange=0
  size=COY
  symbol="|"
  type='infantry'
}

class COYCavalry extends Unit {
  armour=7
  attack = {
    'hsl(000 50 50)': 1
  }
  fieldMove=2
  iDie='hsl(100 50 50)'
  iRange=1
  size=COY
  symbol="|"
  type='cavalry'
}

class COYArtillery extends Unit {
  armour=1
  attack = {}
  fieldMove=1
  iDie='hsl(000 50 50)'
  iRange=2
  size=COY
  symbol="|"
  type='artillery'
}

class COYDragoon extends Unit {
  armour=4
  attack = {
    'hsl(000 50 50)': 1
  }
  fieldMove=2
  iDie=null
  iRange=0
  size=COY
  symbol="|"
  type='dragoon'
}

class BTNDragoon extends Unit {
  armour=6
  attack = {
    'hsl(000 50 50)': 2
  }
  fieldMove=2
  iDie=null
  iRange=0
  size=BTN
  symbol="||"
  type='dragoon'
}

