class Soldier {
  constructor(rank,role,name,tile,level) {
    let self=this
    this.rank = rank ?? 0
    this.role = role ?? "Rifleman"
    this.name = name ?? Ranks['e'][rank].name
    this.tile = this.nextStep = tile
    this.x = (this.tile.i/2)*tileSize
    this.y = this.tile.j*tileSize/Math.cos(Math.PI/6)*3/4
    this.level = level ?? 1
    this.kit = Kits[role]
    this.pathTo = new Map()
    this.tentativePath = []
    this.activePath = []
    this.frame = 0
    this.facing = 0
    this.mode = 'rifle'
    this.pose = 'idle'
    this.pointCost = 0
    this.energy = {
      regen: 100,
      datum: 100,
      spent: 0,
      costs: 0,
      // get costs() {return Math.max(0,self.pointCost)*10},
      get max()   {return this.datum+this.regen/2},
      get total() {return this.spent+this.costs},
      get avail() {return this.regen+this.datum/2},
      get bonus() {return this.regen+(this.datum-this.total)/2},
      get taken() {return this.regen+(this.datum-this.total)*2},
      get carry() {return this.regen+(this.datum-this.total)*(this.datum<this.total?2:1/2)}
    }
  }
}
