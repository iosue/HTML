import gameDefs from "./gameDefs.json" with {type:'json'}

Array.prototype.getRandom=function() {
  return this[Math.floor(Math.random()*this.length)]
}

const terrains={
  rock:{
    hue: 100, sat:  5, lum: 35, speed: 2
  },
  dirt:{
    hue:  40, sat: 30, lum: 30, speed: 3
  },
  grass:{
    hue: 100, sat: 35, lum: 30, speed: 4
  },
  wheat:{
    hue:  60, sat: 35, lum: 35, speed: 5
  },
  woods:{
    hue: 100, sat: 30, lum: 25, speed: 7
  },
  water:{
    hue: 200, sat: 50, lum: 35, speed: 10
  },
}


export default class Hex {
  constructor(i,j) {
    this.i=i
    this.j=j
    this.x=(i-(j%2)/2)*gameDefs.hex.mDiameter
    this.y=j*gameDefs.hex.mDiameter*0.75**0.5
    this.beat=Math.random()*0
    this.terrain=Object.keys(terrains).getRandom()
    this.terrain='grass'
    for (const param in terrains[this.terrain]) {
      this[param]=terrains[this.terrain][param]
    }
  }
  get path() {
    let p=new Path2D(),
        d=gameDefs.hex.mDiameter,
        D=d/0.75**0.5
    p.moveTo(+0/2,-D/2)
    p.lineTo(+d/2,-D/4)
    p.lineTo(+d/2,+D/4)
    p.lineTo(-0/2,+D/2)
    p.lineTo(-d/2,+D/4)
    p.lineTo(-d/2,-D/4)
    p.closePath()
    return p
  }
  draw(ctx) {
    let p=this.path
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.clip(p)
    ctx.fillStyle=`hsl(${terrains[this.terrain].hue} ${terrains[this.terrain].sat} ${terrains[this.terrain].lum})`
    ctx.fill(p)
    ctx.stroke(p)

    ctx.beginPath()
    for (let n=0;n<3;n++) {
      ctx.moveTo(-gameDefs.hex.mDiameter/2,0)
      ctx.lineTo(+gameDefs.hex.mDiameter/2,0)
      ctx.rotate(Math.PI/3)
    }
    ctx.lineWidth=gameDefs.hex.mDiameter/8
    let nextTerrain={
      woods:"grass",
      wheat:"grass",
      grass:"dirt",
      dirt:"rock",
      rock:"road",
      water:"water"
    }[this.terrain]
    let maxSteps={
      woods:2,
      wheat:1,
      grass:1,
      dirt:1,
      rock:1,
      water:10
    }[this.terrain]
    ctx.strokeStyle=`hsl(${{...terrains,road:{hue:100,sat:5,lum:5,speed:1}}[nextTerrain].hue} ${{...terrains,road:{hue:100,sat:5,lum:5,speed:1}}[nextTerrain].sat} ${{...terrains,road:{hue:100,sat:5,lum:5,speed:1}}[nextTerrain].lum}/${this.beat/maxSteps/5})`
    ctx.stroke()

    ctx.restore()
  }
  highlight(ctx,stroke='white',fill='cyan') {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.strokeStyle=stroke
    ctx.stroke(this.path)
    ctx.fillStyle=fill
    ctx.fillText(`${this.i}:${this.j}`,0,0)
    ctx.restore()
  }
  ident(ctx,stroke='white',fill='cyan') {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.strokeStyle=stroke
    ctx.stroke(this.path)
    ctx.fillStyle=fill
    ctx.textBaseline='bottom'
    ctx.fillText(`${this.terrain}`,0,0)
    ctx.restore()
  }
  stepOn() {
    if (this.terrain=='water') return 'no change'
    this.beat++
    this.beat%=5
  }
  get nAddresses() {
    const d=this.j%2
    return [
      [ this.i-d, this.j-1 ],[ this.i-d+1, this.j-1 ],
      [ this.i-1, this.j+0 ],[ this.i+0+1, this.j+0 ],
      [ this.i-d, this.j+1 ],[ this.i-d+1, this.j+1 ],
    ]
  }
  nList(dataSet,d=2) {
    if (d==1) return this.nAddresses.map(n=>dataSet.find(h=>h.i==n[0]&&h.j==n[1]))
    return this.nAddresses.map(n=>dataSet?.[n[0]]?.[n[1]])
  }
}
