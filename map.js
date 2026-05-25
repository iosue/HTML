import {CVS,CTX} from './canvas.js'

export function drawMap(ctx=CTX['map']) {
  ctx.drawImage(CVS['bmp'],0,0)
}

export function drawStaticGrid(ctx=CTX['map']) {
  ctx.drawImage(CVS['grid'],0,0)
}

export function drawGrid(lyrName='hudGrid') {
  let ctx=CTX[lyrName],
      I=CVS[lyrName].width,
      J=CVS[lyrName].height,
      gapX=50, gapY=50

  ctx.font='16px consolas'
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.fillStyle=ctx.strokeStyle=`hsl(000 00 100/.5)`
  for (let i=1;i<I/gapX;i++) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(i*gapX,0)
    ctx.lineTo(i*gapX,J)
    ctx.stroke()
    ctx.restore()
  }
  for (let j=1;j<J/gapY;j++) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0,j*gapY)
    ctx.lineTo(J,j*gapY)
    ctx.stroke()
    ctx.restore()
  }
  for (let i=1;i<I/gapX;i++) {
    ctx.save()
    ctx.translate((i+1/2)*gapX,0+16)
    ctx.fillRect(-16,-16,32,32)
    ctx.fillText(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i],0,0)
    ctx.restore()
  }
  for (let j=1;j<J/gapY;j++) {
    ctx.save()
    ctx.translate(16,(j+1/2)*gapY)
    ctx.fillRect(-16,-16,32,32)
    ctx.fillText(j||'',0,0)
    ctx.restore()
  }
}