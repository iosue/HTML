import {CVS,CTX} from "./canvas.js"
import gameDefs from "./gameDefs.json" with {type:'json'}


export const C={x:1000,y:1000,z:1,v:10/9},
  M={x:innerWidth/2,y:innerHeight/2,b:{}}

export function lockCamera() {
  C.x=Math.max(C.x,0)
  C.x=Math.min(C.x,CVS['bmp'].width-gameDefs.hex.mDiameter*2)

  C.y=Math.max(C.y,0)
  C.y=Math.min(C.y,CVS['bmp'].height-gameDefs.hex.mDiameter*0.75**0.5*21/16)

  C.z=Math.max(C.z,0.5)
  C.z=Math.min(C.z,Math.min(CVS['bmp'].width/innerWidth,CVS['bmp'].height/innerHeight)*2)
}

export function zoomToC(layers) {
  for (const lyr of layers) {
    let ctx=CTX[lyr.name]
    if (lyr.resize) {
      ctx.translate(innerWidth/2,innerHeight/2)
      ctx.scale(1/C.z,1/C.z)
      ctx.translate(-C.x,-C.y)
    }
  }
}
