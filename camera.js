import {CTX} from "./canvas.js"


export const C={x:0,y:0,z:1,v:10/9},
  M={x:0,y:0,b:{}}

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
