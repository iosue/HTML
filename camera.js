import {CTX} from "./canvas.js"


export const C={x:0,y:0,z:1,v:10/9},
  M={x:0,y:0,b:{}}

export function zoomToC(layers) {
  for (const lyr of layers) {
    if (lyr.resize) {
      CTX[lyr.name].translate(innerWidth/2,innerHeight/2)
      CTX[lyr.name].scale(1/C.z,1/C.z)
      CTX[lyr.name].translate(-C.x,-C.y)
    }
  }
}
