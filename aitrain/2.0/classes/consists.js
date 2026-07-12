import { deg } from '../helpers.js'
import * as settings from '../defaults.js'
import { Bogie } from './bogies.js'
import { Car, Engine } from './cars.js'


export class Consist {
  constructor(network,id,car,dir) {
    this.network = network
    this.id = id
    this.cars = new Map()
    if (car) this.cars.set(car,dir)
  }
  get hitchTail() {
    const endCar = [...this.cars.keys()].toReversed()[0]
    // console.log(this.cars,endCar,this.cars.get(endCar))
    const endHitch = this.cars.get(endCar)<0?endCar.A:endCar.B
    return endHitch
  }
  get hitchHead() {
    const endCar = [...this.cars.keys()][0]
    const endHitch = this.cars.get(endCar)<0?endCar.B:endCar.A
    return endHitch
  }
  hitch(consist,itsEnd) {
    let carList = [...consist.cars]
    let backward = false
    if (itsEnd=="B") {
      carList.reverse()
      backward = true
    }
    // let backward=this.hitchTail.position==consist[`hitch${itsEnd}`].position;
    [...carList].forEach(([car,dir])=>this.cars.set(car,backward?-dir:dir))
    this.network.consists.delete(consist.id)
  }

  update(ctx) {
    let activeEngine = this.network.engines.get(this.network.activeEngineId)
    if (!this.cars.has(activeEngine)) return this.draw(ctx)

    let carList = [...this.cars]
    carList.reduce(([prevCar,prevCarDir],[nextCar,nextCarDir])=>{
      const uBogie = prevCarDir>0?prevCar.B:prevCar.A
      const [vBogie,wBogie] = nextCarDir?[nextCar.A,nextCar.B]:[nextCar.B,nextCar.A]
      uBogie.hitched=vBogie.hitched=true
      let frontEnd = vBogie.followBogie(uBogie,-settings.hitchLength*2,1)
      let backEnd = wBogie.followBogie(vBogie,-nextCar.length,1)
      if ((frontEnd||backEnd)=="end of track") {
        console.log(frontEnd,backEnd)
        activeEngine.speed = 0
        return this.backPropagate(wBogie,vBogie)
      }
      return [nextCar,nextCarDir]
    })
    this.draw(ctx)
  }

  backPropagate(anchor,partner) {
    console.log(
      anchor.id,anchor.track.id,anchor.trackPosition,
      partner.id,partner.track.id,partner.trackPosition,
    )
    anchor.trackPosition = (anchor.direction>0)?0:1
    partner.followBogie(anchor,anchor.car.length,true)
    console.log(
      anchor.id,anchor.track.id,anchor.trackPosition,
      partner.id,partner.track.id,partner.trackPosition,
    )

    let carList = [...this.cars].toReversed()
    carList.reduce(([prevCar,prevCarDir],[nextCar,nextCarDir])=>{
      const uBogie = prevCarDir<0?prevCar.B:prevCar.A
      const [vBogie,wBogie] = nextCarDir?[nextCar.B,nextCar.A]:[nextCar.A,nextCar.B]
      vBogie.followBogie(uBogie,settings.hitchLength*2,1)
      wBogie.followBogie(vBogie,nextCar.length,1)
      console.log(
        uBogie.id,uBogie.track.id,uBogie.trackPosition,
        vBogie.id,vBogie.track.id,vBogie.trackPosition,
        wBogie.id,wBogie.track.id,wBogie.trackPosition,
      )
      return [nextCar,nextCarDir]
    })

    // throw new Error()
  }

  _update(ctx) {
    let activeEngine = this.network.engines.get(this.network.activeEngineId)
    if (this.cars.has(activeEngine)) {
      // console.log(this.cars);
      [...this.cars].reduce((prev,next)=>{
        // console.log(prev,next);
        let [prevCar,prevDir] = prev,
            [nextCar,nextDir] = next
        let prevBogie = prevDir<0?prevCar.A:prevCar.B
        let [pBogie,qBogie] = nextDir>0?[nextCar.A,nextCar.B]:[nextCar.B,nextCar.A]
        prevBogie.hitched = true
        pBogie.hitched = true
        let dir = prevCar.direction==nextCar.direction?1:-1
        pBogie.followBogie(prevBogie,40*-dir)
        if (qBogie.followBogie(pBogie,nextCar.length*dir)=="end of track") {
          activeEngine.speed = 0
          return this.backPropagate(qBogie,pBogie)
        }
        // console.log(nextCar)
        return next
      })
      this.bumpCheck()
    }
    this.draw(ctx)
  }

  _backPropagate(anchor,partner) {
    console.log('backPropagate')
    anchor.trackPosition = anchor.direction>0?0:1
    partner.followBogie(anchor,-anchor.car.length);
    [...this.cars.keys()].toReversed().reduce((prevCar,nextCar)=>{
      let prevBogie = this.cars.get(prevCar)>0?prevCar.A:prevCar.B
      let [pBogie,qBogie] = this.cars.get(nextCar)<0?[nextCar.A,nextCar.B]:[nextCar.B,nextCar.A]
      pBogie.followBogie(prevBogie,-40)
      qBogie.followBogie(pBogie,-nextCar.length)
    })
  }

  old_update(ctx) {
    let activeEngine = this.network.engines.get(this.network.activeEngineId)
    if (this.cars.has(activeEngine)) {
      const engineIndex = [...this.cars.keys()].indexOf(activeEngine)
      if (engineIndex==0) {
        [...this.cars.keys()].reduce((prevCar,nextCar)=>{
          let prevBogie = this.cars.get(prevCar)<0?prevCar.A:prevCar.B
          let nextBogie = this.cars.get(nextCar)>0?nextCar.A:nextCar.B
          nextBogie.setRelativeTrackPos(prevBogie,40)
          return nextCar
        })
      }
      // console.log(this.id,engineIndex)
      this.bumpCheck()
    }
    this.draw(ctx)
  }

  bumpCheck() {
    this.network.consists.forEach(consist=>{
      // console.log(consist,this)
      if (consist != this) {
        function inRange(a,b) {
          const dx = b.x - a.x,
          dy = a.y - a.y
          let dist = Math.hypot(dx,dy)
          if (a.trackId==b.trackId || a.track.nextTrack?.id==b.trackId || a.track.prevTrack?.id==b.trackId) return Math.abs(dist) < 40
        }
  
        if (inRange(this.hitchTail,consist.hitchTail)) {
          console.log(this,'bump a')
          return this.hitch(consist,"A")
        }
        if (inRange(this.hitchTail,consist.hitchHead)) {
          console.log(this,this.hitchHead,'bump b')
          return this.hitch(consist,"B")
        }
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
    this.foreConsist = new Consist(network,`${id}Fore`,engine,-1)
    this.rearConsist = new Consist(network,`${id}Rear`,engine,+1)
  }

  update(ctx) {
    this.foreConsist.update(ctx)
    this.rearConsist.update(ctx)
  }
}