import gameDefs from "./gameDefs.json" with {type:'json'}


export const CVS={}, CTX={}

function setFont(ctx) {
  ctx.font="10px consolas"
  ctx.textAlign="center"
  ctx.textBaseline="middle"
  ctx.strokeStyle="hsl(0 10 20)"
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