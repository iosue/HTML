import {C,M} from "./camera.js"

addEventListener('contextmenu',e=>{
  if (!e.ctrlKey) e.preventDefault()
})
addEventListener('mousemove',e=>{
  M.x=e.x
  M.y=e.y
  if (M.b[1]) {
    C.x-=e.movementX*C.z
    C.y-=e.movementY*C.z
  }
})
addEventListener('mousedown',e=>M.b[e.button]=true)
addEventListener('mouseup',e=>delete M.b[e.button])
addEventListener('wheel',e=>{
  C.x+=(M.x-innerWidth/2)*C.z
  C.y+=(M.y-innerHeight/2)*C.z
  C.z*=C.v**Math.sign(e.deltaY)
  C.y-=(M.y-innerHeight/2)*C.z
  C.x-=(M.x-innerWidth/2)*C.z
})