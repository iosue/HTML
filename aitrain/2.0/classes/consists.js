import { deg } from '../helpers.js'
import * as settings from '../defaults.js'
import { Bogie } from './bogies.js'
import { Car, Engine } from './cars.js'


export class Consist {
  constructor(network,id,car) {
    this.network = network
    this.id = id
    this.cars = new Map()
    this.cars.set(car,1)
  }
  get hitchA() {
    const endCar = [...this.cars.keys()].toReversed()[0]
    const endHitch = this.cars[endCar]==1?endCar.A:endCar.B
    return endHitch
  }
  get hitchB() {
    const endCar = [...this.cars.keys()][0]
    const endHitch = this.cars[endCar]==1?endCar.B:endCar.A
    return endHitch
  }
  hitch(consist,myEnd,itsEnd) {
    if (myEnd=="B") {
      if (itsEnd=="B") consist.cars = consist.cars.toReversed()
      this.cars.push(...consist.cars)
    }
    if (myEnd=="A") {
      if (itsEnd=="A") consist.cars = consist.cars.toReversed()
      this.cars.unshift(...consist.cars)
    }
    this.network.consists.delete(consist.id)
  }

  update(ctx) {
    let activeEngine = this.network.engines.get(this.network.activeEngineId)
    if (this.cars.has(activeEngine)) {
      const engineIndex = [...this.cars.keys()].indexOf(activeEngine)
      if (engineIndex==0) {
        [...this.cars.keys()].reduce((prevCar,nextCar)=>{
          console.log(this.cars,prevCar,this.cars.get(prevCar),nextCar,this.cars.get(nextCar))
          let keyBogie = this.cars.get(nextCar)>0?nextCar.A:nextCar.B
          // console.log(keyBogie,this.cars[nextCar])
          keyBogie.setRelativeTrackPos(prevCar,40)
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
      // console.log(consist)
      if (consist != this) {
        const dxAA = consist.hitchA.x - this.hitchA.x,
              dyAA = consist.hitchA.y - this.hitchA.y,
              distAA = Math.hypot(dxAA,dyAA),
  
              dxAB = consist.hitchB.x - this.hitchA.x,
              dyAB = consist.hitchB.y - this.hitchA.y,
              distAB = Math.hypot(dxAB,dyAB),
  
              dxBA = consist.hitchA.x - this.hitchB.x,
              dyBA = consist.hitchA.y - this.hitchB.y,
              distBA = Math.hypot(dxBA,dyBA),
  
              dxBB = consist.hitchB.x - this.hitchB.x,
              dyBB = consist.hitchB.y - this.hitchB.y,
              distBB = Math.hypot(dxBB,dyBB)
  
        if (distAA < 40) {
          // console.log(this.hitchA,consist.hitchA,distAA)
        }
        if (distAB < 40) {
          // console.log(this.hitchA,consist.hitchB,distAB)
        }
        if (distBA < 40) {
          // console.log(this.hitchB,consist.hitchA,distBA)
        }
        if (distBB < 40) {
          // console.log(this.hitchB,consist.hitchB,distBB)
        }
      }
    })
  }
  draw(ctx) {
    const dx = this.hitchB.x - this.hitchA.x,
          dy = this.hitchB.y - this.hitchA.y
    ctx.save()
    ctx.translate(this.hitchA.x,this.hitchA.y)
    ctx.rotate(Math.atan2(dy,dx))
    ctx.beginPath()
    ctx.roundRect(-20,-20,Math.hypot(dx,dy)+40,40,20)
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
    this.foreConsist = new Consist(network,`${id}Fore`,engine)
    this.rearConsist = new Consist(network,`${id}Rear`,engine)
  }

  update(ctx) {
    this.foreConsist.update(ctx)
    this.rearConsist.update(ctx)
  }
}