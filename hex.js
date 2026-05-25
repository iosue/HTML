import gameDefs from "./gameDefs.json" with {type:'json'}

export default class Hex {
  constructor(i,j) {
    this.i=i
    this.j=j
    this.x=(i-(j%2)/2)*gameDefs.hex.mDiameter
    this.y=j*gameDefs.hex.mDiameter*0.75**0.5
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
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.clip(this.path)
    ctx.stroke(this.path)
    ctx.fillText(`${this.i}:${this.j}`,0,0)
    ctx.restore()
  }
  highlight(ctx) {
    ctx.save()
    // ctx.translate(this.x,this.y)
    ctx.strokeStyle='white'
    ctx.stroke(this.path)
    ctx.fillStyle='cyan'
    ctx.fillText(`${this.i}:${this.j}`,0,0)
    ctx.restore()
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
