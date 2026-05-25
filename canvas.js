import gameDefs from "./gameDefs.json" with {type:'json'}


export const CVS={}, CTX={}

function setFont(ctx) {
  ctx.font="16px consolas"
  ctx.textAlign="center"
  ctx.textBaseline="middle"
  ctx.strokeStyle="salmon"
  ctx.fillStyle="goldenrod"
}

export function initCanvi(layers) {
    for (const lyr of layers) {
    if (lyr.offscreen) {
      CVS[lyr.name]=new OffscreenCanvas(
        lyr.width ??gameDefs.map.cols*gameDefs.hex.mDiameter           +gameDefs.hex.mDiameter/2,
        lyr.height??gameDefs.map.rows*gameDefs.hex.mDiameter*0.75**0.5 +gameDefs.hex.mDiameter/2/3**0.5
      )
    } else {
      CVS[lyr.name]=document.createElement('canvas')
      CVS[lyr.name].id=lyr.name
      document.body.appendChild(CVS[lyr.name])
    }
    CTX[lyr.name]=CVS[lyr.name].getContext('2d')
    setFont(CTX[lyr.name])
  }
}

export function generateGrid(lyrName='grid') {
  let ctx=CTX[lyrName],
      I=CVS[lyrName].width,
      J=CVS[lyrName].height,
      gapX=100, gapY=100
  for (let i=1;i<I/gapX;i++) {
    ctx.save()
    ctx.fillStyle=ctx.strokeStyle=`hsl(000 00 100/0.5)`
    ctx.fillText(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i],i*gapX,0+16)
    ctx.fillText(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i],i*gapX,J-16)
    ctx.beginPath()
    ctx.moveTo(i*gapX,0+32)
    ctx.lineTo(i*gapX,J-32)
    ctx.stroke()
    ctx.restore()
  }
  for (let j=1;j<J/gapY;j++) {
    ctx.save()
    ctx.fillStyle=ctx.strokeStyle=`hsl(000 00 100/.5)`
    ctx.fillText(j||'',0+16,j*gapY)
    ctx.fillText(j||'',J-16,j*gapY)
    ctx.beginPath()
    ctx.moveTo(0+32,j*gapY)
    ctx.lineTo(J-32,j*gapY)
    ctx.stroke()
    ctx.restore()
  }
}

export function resetCanvi(layers) {
  for (const lyr of layers) {
    let cvs=CVS[lyr.name]
    if (lyr.reset) {
      cvs.width=innerWidth
      cvs.height=innerHeight
    }
    setFont(CTX[lyr.name])
  }
}  