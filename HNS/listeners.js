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
addEventListener('click',e=>{
  // pause=!pause
  // if (!pause) refresh()
  // console.log(pause?'pause':'resume')
})
addEventListener('mousedown',e=>M.b[e.button]=true)
addEventListener('mouseup',e=>delete M.b[e.button])
addEventListener('wheel',e=>{
  C.x+=(e.x-innerWidth/2)*C.z
  C.y+=(e.y-innerHeight/2)*C.z
  C.z*=C.v**Math.sign(e.deltaY)
  C.y-=(e.y-innerHeight/2)*C.z
  C.x-=(e.x-innerWidth/2)*C.z
})
addEventListener('keydown',e=>{
  if (e.code=='Escape') {
    pause=!pause
    if (!pause) refresh()
    console.warn(pause?'pause':'resume')
  } else if (!pause) {
    if (!K.blocked[e.code]) {
      K[e.code]=true
      K.blocked[e.code]=true
    }
  }
})
addEventListener('keyup',e=>{
  delete K[e.code]
  delete K.blocked[e.code]
})