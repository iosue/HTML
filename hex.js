import gameDefs from "./gameDefs.json" with {type:'json'}

export default class Hex {
  constructor(i,j) {
    this.i=i
    this.j=j
    this.x=(i-(j%2)/2)*gameDefs.hex.mDiameter
    this.y=j*gameDefs.hex.mDiameter*0.75**0.5
  }
  get path() {
    let p=new Path2D()
    p.translate(this.x,this.y)
    for (let i=0;i<6;i++) {
      p.lineTo(gameDefs.hex.mDiameter,-gameDefs.hex.mDiameter*Math.tan(Math.PI/6))
      p.rotate(Math.PI/3)
    }
    p.closePath()
    p.clip()
    return p
  }
  draw(ctx=CTX['bmp']) {
    ctx.save()
    ctx.strokeStyle='salmon'
    ctx.stroke(this.path)
    ctx.restore()
  }
  highlight(ctx=CTX['map']) {

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
