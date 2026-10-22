Soldier.prototype.camTo = function() {
  let dx = this.x - C.x
  let dy = this.y - C.y
  let eDist = Math.hypot(dx,dy)
  const stepSize = eDist/2
  let angle = Math.atan2(dy,dx)
  let stepX = Math.minAbs(dx,stepSize*Math.cos(angle))
  let stepY = Math.minAbs(dy,stepSize*Math.sin(angle))
  // if (stepX<0.05) stepX = 0
  // if (stepY<0.05) stepY = 0
  C.x += stepX
  C.y += stepY
  if (stepX + stepY > 1) delete this.focus
}

Soldier.prototype.stepTo = function(tile) {
  // console.log(tile)
  this.nextStep = tile
  this.pose = 'move'
}


Soldier.prototype.move = function() {
  if (this.tentativePath.length) {
    Game.phase = 'wait_move'
    this.activePath = this.tentativePath
    this.pose = 'move'
  }
}

Soldier.prototype.shoot = function(target) {
  Game.phase = 'wait_shoot'
  this.frame = 0
  this.pose = 'shoot'
  this.aim(target)
}

Soldier.prototype.suppress = function() {
  let target = Game.hoverHex
  Game.phase = 'wait_suppress'
  setTimeout(()=>this.shoot(target),0)
  setTimeout(()=>this.shoot(target),120)
  setTimeout(()=>this.shoot(target),240)
}
