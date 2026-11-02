Soldier.prototype.update = function() {
  this.frame+=1/2

  if (this.pose=='shoot'&&this.frame>=3) {
    this.pose='idle'
    delete Game.phase
  }

  if (this.tile==this.activePath[0]?.tile) {
    this.activePath.shift()
    this.pose = 'idle'
    if (this.activePath.length) this.stepTo(this.activePath[0].tile)
    else delete Game.phase
  }

  if (this.x != this.nextStep.x || this.y != this.nextStep.y) {
    const stepSize = 12
    let dx = this.nextStep.x - this.x
    let dy = this.nextStep.y - this.y
    let eDist = Math.hypot(dx,dy)
    let angle = Math.atan2(dy,dx)
    let stepX = Math.minAbs(dx,stepSize*Math.cos(angle))
    let stepY = Math.minAbs(dy,stepSize*Math.sin(angle))
    this.x += stepX
    this.y += stepY
    if (this.activePath[1]) {
      let ndx = this.activePath[1].tile.x - this.x
      let ndy = this.activePath[1].tile.y - this.y
      let neDist = Math.hypot(ndx,ndy)
      let nAngle = Math.atan2(ndy,ndx)
      if (neDist<tileSize*1.125) {
        angle = nAngle
      }
    }
    let da = angle-this.facing
    if (da<=-Math.PI) da += Math.PI*2
    this.facing += da/4 //Math.minAbs(da,Math.sign(da)*0.1)
  } else {
    this.tile = this.nextStep
  }

  this.draw()

  if (this==Game.activePC) {
    switch (Game.phase) {

      case "plan_move":{
        this.drawPath(this.tentativePath=this.getPathBetween(this.tile,Game.hoverHex),'hsl(50 80 50)')
        this.energy.costs = Math.max(0,this.tentativePath.length-1)*10
      } break
      case "wait_move":{
        this.drawPath(this.activePath,'hsl(50 20 50)')
        if (this.nextStep==this.tile) {
          let stepCost=10
          console.log(this.energy)
          this.energy.costs -= stepCost
          this.energy.spent += stepCost
        }
      } break

      case "plan_shoot":{
        this.aim()
      } break
      case "wait_shoot":{
        this.aim()
      } break

      case "plan_suppress":{
        this.aim()
      } break

      default: {
        // console.log(Game.phase)
      }
    }
    // this.drawGauge(CTX['gui'])
  }
}

Soldier.prototype.pathFromTo = {}


Soldier.prototype.getPathBetween = function(start=this.tile,goal=Game.hoverHex) {
  if (!Game.hoverHex) return []
  this.pathFromTo[`${start.j}:${start.i}`]??={}
  return this.pathFromTo[`${start.j}:${start.i}`][`${goal.j}:${goal.i}`]??=this.getPathTo(start,goal)
}






Soldier.prototype.getPathTo = function(start=this.tile,finish=Game.hoverHex) {

  let H=(a,b=finish)=>Math.hypot(a.x-b.x,a.y-b.y),
      D=(a,b)=>Math.abs(b.k-a.k)>3?100: 1 + (a.k<b.k)?(b.k-a.k)*10:(a.k-b.k)/2
    D=(a,b)=>a.k==0||b.k==0?Infinity:(a.k**2+b.k**2)*tileSize
  function trace(before,tile,heading) {
    const path=[{tile,cost:gScore.get(tile)}]
    while(before.get(tile)) {
      cost = before.get(tile)['cost']
      step = before.get(tile)['step']
      heading = before.get(tile)['heading']
      tile = before.get(tile)['tile']
      path.unshift({tile,heading,step,cost})
    }
    return path
  }
  const openSet = [start],
        before = new Map(),
        fScore = new Map([[start,H(start)]]),
        gScore = new Map([[start,0]])
  while (openSet.length) {
    let {tile:current,index} = openSet.reduce((prev,tile,index)=>{
      let score = fScore.get(tile)
      if (score<prev.score || score==prev.score && Math.random()<0.5) {
        return {tile,score,index}
      } else {
        return prev
      }
    }, {tile:null,score:Infinity,index:-1})
    if (current==finish) return trace(before,current)
    openSet.splice(index,1)
    for (const [direction,neighbour] of current.neighbours) {
      let test = gScore.get(current) + D(current,neighbour)
      if (test < (gScore.get(neighbour)??Infinity)) {
        before.set(neighbour,{'tile':current,'heading':direction,'step':D(current,neighbour),'cost':gScore.get(current)})
        gScore.set(neighbour,test)
        fScore.set(neighbour,test+H(neighbour))
        openSet.includes(neighbour) || openSet.push(neighbour)
      }
    }
  }
  return console.warn(`no path from ${start.j}:${start.i} to ${finish.j}:${finish.i}`)||[]
}

// Soldier.prototype._getPathTo = function(finish) {
//   let start = this.target
//   // console.log(start,'getting path to',finish)
//   const H=(a,b=finish)=>Math.hypot(a.x-b.x,a.y-b.y),
//         D=(a,b)=>Math.abs(b.k-a.k)>3?Infinity: 1 + (a.k<b.k)?(b.k-a.k)*10:(a.k-b.k)/2
//   function trace(before,tile,heading) {
//     const path=[{tile}]
//     while(before.get(tile)) {
//       heading = before.get(tile)['heading']
//       tile = before.get(tile)['tile']
//       path.unshift({tile,heading})
//     }
//     return path
//   }
//   const openSet = [start],
//         before = new Map(),
//         fScore = new Map([[start,H(start)]]),
//         gScore = new Map([[start,0]])
//   while (openSet.length) {
//     let {tile:current,index} = openSet.reduce((prev,tile,index)=>{
//       let score = fScore.get(tile)
//       if (score<prev.score || score==prev.score && Math.random()<0.5) {
//         return {tile,score,index}
//       } else {
//         return prev
//       }
//     }, {tile:null,score:Infinity,index:-1})
//     if (current==finish) return trace(before,current)
//     openSet.splice(index,1)
//     for (const [direction,neighbour] of current.neighbours) {
//       let test = gScore.get(current) + D(current,neighbour)
//       if (test < (gScore.get(neighbour)??Infinity)) {
//         before.set(neighbour,{'tile':current,'heading':direction})
//         gScore.set(neighbour,test)
//         fScore.set(neighbour,test+H(neighbour))
//         openSet.includes(neighbour) || openSet.push(neighbour)
//       }
//     }
//   }
//   return console.warn(`no path from ${start.j}:${start.i} to ${finish.j}:${finish.i}`)||[]
// }
