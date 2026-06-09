import gameDefs from "./gameDefs.json" with {type:'json'}
import Hex from './hex.js'
import {CVS,CTX} from './canvas.js'
import {C} from './camera.js'

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


export function generateGrid(lyrName='hudGrid') {
  let ctx=CTX[lyrName],
      I=CVS[lyrName].width,
      J=CVS[lyrName].height,
      dX=gameDefs.hex.mDiameter,
      dY=gameDefs.hex.mDiameter/0.75**0.5,
      fontSize=12

  ctx.font=`${fontSize}px consolas`

  ctx.save()
  ctx.fillStyle=ctx.strokeStyle=`hsl(200 75 75/0.5)`
  for (let i=1;i<I/dX;i++) {
    ctx.fillText(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i],i*dX,0+fontSize)
    ctx.fillText(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i],i*dX,J-fontSize)
    ctx.beginPath()
    ctx.moveTo(i*dX,0)
    ctx.lineTo(i*dX,J)
    ctx.stroke()
  }
  ctx.restore()

  for (let j=1;j<J/dY;j++) {
    ctx.save()
    ctx.fillStyle=ctx.strokeStyle=`hsl(000 00 100/.5)`
    ctx.fillText(j||'',0+fontSize,j*dY)
    ctx.fillText(j||'',J-fontSize,j*dY)
    ctx.beginPath()
    ctx.moveTo(0+fontSize*2,j*dY)
    ctx.lineTo(J-fontSize*2,j*dY)
    ctx.stroke()
    ctx.restore()
  }
}

export function drawStaticGrid(ctx=CTX['map']) {
  ctx.drawImage(CVS['grid'],0,0)
}

export function drawGrid(lyrName='hudGrid') {
  let ctx=CTX[lyrName],
      I=gameDefs.map.cols*gameDefs.hex.mDiameter,
      J=gameDefs.map.rows*gameDefs.hex.mDiameter*0.75**0.5,
      dX=gameDefs.hex.mDiameter,
      dY=gameDefs.hex.mDiameter*0.75**0.5,
      fontSize=12

  ctx.font=`${fontSize}px consolas`
  ctx.fillStyle=`hsl(200 75 75/.5)`
  ctx.strokeStyle=`hsl(200 75 75/.125)`

  ctx.save()
  ctx.translate(-gameDefs.hex.mDiameter/4/C.z,0)

    ctx.save()
    ctx.translate(innerWidth/2-C.x/C.z,0)
    for (let i=0;i<I/dX;i++) {
      ctx.beginPath()
      ctx.moveTo(0,0+fontSize*2)
      ctx.lineTo(0,innerHeight-fontSize*2)
      ctx.stroke()
      ctx.translate(dX/C.z,0)
    }
    ctx.restore()

    ctx.save()
    ctx.translate(0,innerHeight/2-C.y/C.z)
    for (let j=0;j<J/dY;j++) {
      ctx.beginPath()
      ctx.moveTo(0+fontSize*2,0)
      ctx.lineTo(I-fontSize*2,0)
      ctx.stroke()
      ctx.translate(0,dY/C.z)
    }
    ctx.restore()

    ctx.save()
    ctx.translate(innerWidth/2-C.x/C.z,0)
    for (let i=0;i<I/dX;i++) {
      ctx.beginPath()
      ctx.clearRect(-fontSize,0,fontSize*2,fontSize*2)
      ctx.fillText(i,0,0+fontSize)
      ctx.clearRect(-fontSize,innerHeight-fontSize*2,fontSize*2,fontSize*2)
      ctx.fillText(i,0,innerHeight-fontSize)
      ctx.translate(dX/C.z,0)
    }
    ctx.restore()

  ctx.restore()

  ctx.save()
  ctx.translate(0,innerHeight/2-C.y/C.z)
  for (let j=0;j<J/dY;j++) {
    ctx.beginPath()
    ctx.clearRect(0,-fontSize,fontSize*2,fontSize*2)
    ctx.fillText(j,0+fontSize,0)
    ctx.clearRect(innerWidth-fontSize*2,-fontSize,fontSize*2,fontSize*2)
    ctx.fillText(j,innerWidth-fontSize,0)
    ctx.translate(0,dY/C.z)
  }
  ctx.restore()

}