class Soldier {
  constructor(rank,role,name,tile,level) {
    this.rank = rank ?? 0
    this.role = role ?? "Rifleman"
    this.name = name ?? Ranks['e'][rank].name
    this.tile = this.target = tile
    this.x = (this.tile.i/2)*tileSize
    this.y = this.tile.j*tileSize/Math.cos(Math.PI/6)*3/4
    this.level = level ?? 1
    this.kit = Kits[role]
    this.pathTo = new Map()
    this.targets = []
    this.frame = 0
    this.facing = 0
    this.mode = 'rifle'
    this.pose = 'idle'
    C.x = this.x
    C.y = this.y
    C.z = 1
  }
  moveTo(tile) {
    this.target = tile
    this.pose = 'move'
  }
  update() {
    this.frame+=1/2
    // this.frame%=20
    if (this.pose=='shoot'&&this.frame>=3) {
      this.pose='idle'
    }

    if (this.tile==this.targets[0]?.tile) {
      this.targets.shift()
      this.pose = 'idle'
      if (this.targets.length) this.moveTo(this.targets[0].tile)
    }
    if (this.x != this.target.x || this.y != this.target.y) {
      const stepSize = 6
      let dx = this.target.x - this.x
      let dy = this.target.y - this.y
      let eDist = Math.hypot(dx,dy)
      let angle = Math.atan2(dy,dx)
      let stepX = Math.minAbs(dx,stepSize*Math.cos(angle))
      let stepY = Math.minAbs(dy,stepSize*Math.sin(angle))
      this.x += stepX
      this.y += stepY
      if (this.targets[1]) {
        let ndx = this.targets[1].tile.x - this.x
        let ndy = this.targets[1].tile.y - this.y
        let neDist = Math.hypot(ndx,ndy)
        let nAngle = Math.atan2(ndy,ndx)
        if (neDist<tileSize*1.125) {
          angle = nAngle
        }
      }
      let da = angle-this.facing
      if (da<=-Math.PI) da += Math.PI*2
      this.facing += da/4 //Math.minAbs(da,Math.sign(da)*0.1)
    } else {
      this.tile = this.target
    }
    this.draw()
    this.drawPath()
  }
  draw(ctx=CTX['pcs']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    if (Game.activePC==this) {
      if (Game.hoverHex) {
        if (Game.phase=='aim1'||Game.phase=='aim3'||this.pose=='shoot') this.aim()
        if (Game.phase=='move') this.showPathTo(Game.hoverHex)
      }
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
    // ctx.arc(0,0,40,0,Math.PI*2)
    // ctx.fillStyle='#fff4'
    // ctx.fill()

    // ctx.beginPath()
    // ctx.arc(0,0,140,0,Math.PI*2)
    // ctx.fillStyle='#fff2'
    // ctx.fill()

    // ctx.beginPath()
    // ctx.arc(0,0,1000,0,Math.PI*2)
    // ctx.fillStyle='#fff1'
    // ctx.fill()
    ctx.restore()
  }
  drawPath(ctx=CTX['pth']) {
    ctx.save()
    ctx.beginPath()
    for (const step of this.targets) {
      ctx.lineTo(step.tile.x,step.tile.y)
    }
    ctx.lineWidth=4
    ctx.strokeStyle='salmon'
    ctx.stroke()
    ctx.restore()
  }
  walkPathTo(finish) {
    let key=`${this.tile.i}:${this.tile.j}-${finish.i}:${finish.j}`
    this.targets = this.pathTo.get(key)??[]
    delete Game.phase
    // console.log(this.targets)
  }
  showPathTo(finish,color) {
    let key=`${this.tile.i}:${this.tile.j}-${finish.i}:${finish.j}`
    if (!this.pathTo.get(key)) {
      this.pathTo.set(key,this.getPathTo(finish))
    }

    let ctx=CTX['map']
    ctx.save()
    ctx.beginPath()
    for (const step of this.pathTo.get(key)) {
      ctx.lineTo(step.tile.x,step.tile.y)
      if (step==this.pathTo.entries()[this.pathTo.entries().length-1]) {
        console.log(this)
      }
    }
    ctx.lineWidth=10
    ctx.strokeStyle='white'
    ctx.stroke()
    ctx.restore()
  }
  getPathTo(finish) {
    let start = this.target
    // console.log(start,'getting path to',finish)
    const H=(a,b=finish)=>Math.hypot(a.x-b.x,a.y-b.y),
          D=(a,b)=>Math.abs(b.k-a.k)>3?Infinity: 1 + (a.k<b.k)?(b.k-a.k)*10:(a.k-b.k)/2
    function trace(before,tile,heading) {
      const path=[{tile}]
      while(before.get(tile)) {
        heading = before.get(tile)['heading']
        tile = before.get(tile)['tile']
        path.unshift({tile,heading})
      }
      return path
    }
    const openSet = [start],
          before = new Map(),
          fScore = new Map([[start,H(start)]]),
          gScore = new Map([[start,0]])
    while (openSet.length) {
      let {tile:current,index} = openSet.reduce((prev,tile,index)=>{
        let score = fScore.get(tile)
        if (score<prev.score || score==prev.score && Math.random()<0.5) {
          return {tile,score,index}
        } else {
          return prev
        }
      }, {tile:null,score:Infinity,index:-1})
      if (current==finish) return trace(before,current)
      openSet.splice(index,1)
      for (const [direction,neighbour] of current.neighbours) {
        let test = gScore.get(current) + D(current,neighbour)
        if (test < (gScore.get(neighbour)??Infinity)) {
          before.set(neighbour,{'tile':current,'heading':direction})
          gScore.set(neighbour,test)
          fScore.set(neighbour,test+H(neighbour))
          openSet.includes(neighbour) || openSet.push(neighbour)
        }
      }
    }
    return console.warn(`no path from ${start.j}:${start.i} to ${finish.j}:${finish.i}`)||[]
  }
  aim(ctx=CTX['pth']) {
    let dx=Game.hoverHex.x - this.x
    let dy=Game.hoverHex.y - this.y
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
      ctx.strokeStyle=`hsl(50 100 ${this.frame>.5?0:80})`
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
  shoot() {
    Game.phase = 'fire'
    this.frame = 0
    this.pose = 'shoot'
  }
  suppress(target) {
    setTimeout(()=>this.shoot(),0)
    setTimeout(()=>this.shoot(),120)
    setTimeout(()=>this.shoot(),240)
  }
}
