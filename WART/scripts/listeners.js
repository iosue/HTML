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
    console.warn(pause?'pause':'resume')
  } else {
    K[e.code]=true
    if (e.code=='Tab') e.preventDefault()
  }

})
addEventListener('keyup',e=>{
  delete K[e.code]
  Game.hotkeys[e.code]?.click()
})
addEventListener('click',e=>{
  if (Game.hoverButton) {
    Game.hoverButton.click()
  } else if (Game.activePC && Game.hoverHex) {
    switch (Game.phase) {
      case "plan_move": {
        Game.activePC.move()
      }  break
      case "plan_shoot": {
        Game.activePC.shoot()
      } break
      case "plan_suppress": {
        Game.activePC.suppress()
      } break
    }
  }
})
