addEventListener('contextmenu',e=>{
  if (!e.ctrlKey) e.preventDefault()
  delete Game.phase
  // refresh()
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
  if (K['KeyM']) {
    R-=20*Math.sign(e.deltaY)
    R=Math.max(0,R)
  } else {
    C.x+=M.sx
    C.y+=M.sy
    C.z*=C.v**Math.sign(e.deltaY)
    C.y-=M.sy
    C.x-=M.sx
  }
})
addEventListener('keydown',e=>{
  if (e.code=='Escape') {
    pause=!pause
    if (!pause) refresh()
    console.log(pause?'pause':'resume')
  } else
    K[e.code]=true
})
addEventListener('keyup',e=>{
  delete K[e.code]
  Game.hotkeys[e.code]?.click()
})
addEventListener('click',e=>{
  if (Game.hoverButton) {
    Game.hoverButton.click()
  } else if (Game.activePC && Game.hoverHex) {
    if (Game.phase=='move')
      Game.activePC.walkPathTo(Game.hoverHex)
    else 
    if (Game.phase=='aim1') 
      Game.activePC.shoot(Game.hoverHex)
    if (Game.phase=='aim3') 
      Game.activePC.suppress(Game.hoverHex)
    delete Game.phase
  }
})
