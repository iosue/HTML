import gameDefs from "./gameDefs.json" with {type:'json'}
import Hex from './hex.js'
import {CVS,CTX} from './canvas.js'

export const mapData=[]

export function generateMap(lyrName='grid') {
  let mapImg=document.getElementById('mapImg')
  // CTX['bmp'].drawImage(mapImg,0,0)

  let I=gameDefs.map.cols,J=gameDefs.map.rows

  CTX['bmp'].translate(gameDefs.hex.mDiameter,gameDefs.hex.mDiameter/0.75**0.5/2)
  // CTX['bmp'].translate(0,-gameDefs.hex.mDiameter/0.75**0.5/2)
  for (let i=0;i<I;i++) {
  for (let j=0;j<J;j++) {
    let hex=new Hex(i,j)
    mapData.push(hex)
    hex.draw(CTX['bmp'])
  }}
}


export function drawMap(ctx=CTX['map']) {
  ctx.save()
  ctx.translate(-gameDefs.hex.mDiameter,-gameDefs.hex.mDiameter/0.75**0.5/2)
  ctx.strokeRect(0,0,CVS['bmp'].width,CVS['bmp'].height)
  ctx.drawImage(CVS['bmp'],0,0)
  ctx.restore()
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