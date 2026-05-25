export const CVS={}, CTX={}

export function initCanvi(layers) {
    for (const lyr of layers) {
    if (lyr.offscreen) {
      CVS[lyr.name]=new OffscreenCanvas(lyr.width,lyr.height)
    } else {
      CVS[lyr.name]=document.createElement('canvas')
      CVS[lyr.name].id=lyr.name
      document.body.appendChild(CVS[lyr.name])
    }
    CTX[lyr.name]=CVS[lyr.name].getContext('2d')
  }
}

export function generateMap(lyrName='grid') {
  let mapImg=document.getElementById('mapImg')
  console.log(mapImg)
  // CTX['bmp'].globalAlpha=.9
  CTX['bmp'].drawImage(mapImg,0,0)
}
export function generateGrid(lyrName='grid') {
  let ctx=CTX[lyrName],
      I=CVS[lyrName].width,
      J=CVS[lyrName].height,
      gapX=100, gapY=100
  for (let i=1;i<I/gapX;i++) {
    ctx.save()
    ctx.font='16px consolas'
    ctx.textAlign='center'
    ctx.textBaseline='middle'
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
    ctx.font='16px consolas'
    ctx.textAlign='center'
    ctx.textBaseline='middle'
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
    if (lyr.reset) {
      CVS[lyr.name].width=innerWidth
      CVS[lyr.name].height=innerHeight
    }
  }
}  