import { deg } from '../helpers.js'
import * as settings from '../defaults.js'
import { Bogie, Coupling } from './bogies.js'
import { Car, Engine } from './cars.js'


export class Consist {
  constructor(network,id,car,dir,end) {
    console.log(arguments)
    this.network = network
    this.id = id
    if (this,id.match(/Fore$/)) this.trainConsist = 'Fore'
    if (this,id.match(/Rear$/)) this.trainConsist = 'Rear'
    this.cars = new Map()
    if (car) this.cars.set(car,dir)
  }
  get hitchTail() {
    const endCar = [...this.cars.keys()].toReversed()[0]
    const endHitch = this.cars.get(endCar)<0?endCar.A:endCar.B
    return endHitch
  }
  get hitchHead() {
    const endCar = [...this.cars.keys()][0]
    const endHitch = this.cars.get(endCar)<0?endCar.B:endCar.A
    return endHitch
  }
  hitch(consist,itsEnd) {
    console.log(this,this.trainConsist,consist,itsEnd)
    let carList = [...consist.cars]
    let backward = false
    if (itsEnd=="B") {
      carList.reverse()
      backward = true
    }
    const uBogie = this.hitchTail,
          vBogie = consist[itsEnd=='A'?'hitchHead':'hitchTail']
      uBogie.hitched = vBogie.hitched = true

    let id=performance.now()
    this.network.couplings.set(
      id,
      new Coupling(id,uBogie,vBogie,this)
    )
    // console.log(this.network.couplings)
    // let backward=this.hitchTail.position==consist[`hitch${itsEnd}`].position;
    // console.log(consist,carList)
    ;[...carList].forEach(([car,dir])=>this.cars.set(car,backward?-dir:dir))
    this.network.consists.delete(consist.id)
  }

  update(ctx) {
    let activeEngine = this.network.engines.get(this.network.activeEngineId)
    if (!this.cars.has(activeEngine)) return this.draw(ctx)

    let carList = [...this.cars]
      carList.reduce(([prevCar,prevCarDir],[nextCar,nextCarDir])=>{
      const uBogie = prevCarDir>0?prevCar.B:prevCar.A
      const [vBogie,wBogie] = nextCarDir>0?[nextCar.A,nextCar.B]:[nextCar.B,nextCar.A]
      // uBogie.hitched = vBogie.hitched = true
      let frontEnd = vBogie.followBogie(uBogie,-settings.hitchLength*2*(this.trainConsist=="Fore"?-1:1))
      let backEnd = wBogie.followBogie(vBogie,-nextCar.length*(this.trainConsist=="Fore"?-1:1))
      if ((frontEnd||backEnd)=="end of track") {
        activeEngine.speed = 0
        return this.backPropagate(wBogie,vBogie)
      }
      return [nextCar,nextCarDir]
    })
    this.bumpCheck()
    this.draw(ctx)
  }

  backPropagate(anchor,partner) {
    anchor.trackPosition = (anchor.direction>0)?0:1
    partner.followBogie(anchor,anchor.car.length)

    let carList = [...this.cars].toReversed()
    carList.reduce(([prevCar,prevCarDir],[nextCar,nextCarDir])=>{
      const uBogie = prevCarDir<0?prevCar.B:prevCar.A
      const [vBogie,wBogie] = nextCarDir?[nextCar.B,nextCar.A]:[nextCar.A,nextCar.B]
      vBogie.followBogie(uBogie,settings.hitchLength*2,1)
      wBogie.followBogie(vBogie,nextCar.length,1)
      return [nextCar,nextCarDir]
    })
  }

  bumpCheck() {
    this.network.consists.forEach(consist=>{
      if (consist == this) return

      if (inRange(this.hitchTail,consist.hitchHead)) {
        return this.hitch(consist,"A")
      }
      if (inRange(this.hitchTail,consist.hitchTail)) {
        return this.hitch(consist,"B")
      }

      function inRange(a,b,r=40) {
        const dx = b.x - a.x,
        dy = b.y - a.y
        let dist = Math.hypot(dx,dy)
        if (a.trackId==b.trackId 
          || a.track.nextTrack?.id==b.trackId 
          || a.track.prevTrack?.id==b.trackId) 
              return Math.abs(dist) < r
      }
    })
  }
  draw(ctx) {
    const dx = this.hitchHead.x - this.hitchTail.x,
          dy = this.hitchHead.y - this.hitchTail.y
    ctx.save()
    ctx.translate(this.hitchTail.x,this.hitchTail.y)
    ctx.rotate(Math.atan2(dy,dx))
    ctx.beginPath()
    const p=15
    ctx.roundRect(-p,-p,Math.hypot(dx,dy)+2*p,2*p,p)
    ctx.fillStyle = "#fff2"
    ctx.strokeStyle = "white"
    ctx.setLineDash([10,5])
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}


export class Train {
  constructor(network,id,engine) {
    this.network = network
    this.id = id
    this.engine = engine
    this.foreConsist = new Consist(network,`${id}Fore`,engine,-1,'Fore')
    this.rearConsist = new Consist(network,`${id}Rear`,engine,+1,'Rear')
  }

  update(ctx) {
    this.foreConsist.update(ctx)
    this.rearConsist.update(ctx)
  }
}