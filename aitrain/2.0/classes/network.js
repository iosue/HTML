import { Point, StraightTrack, CurvedTrack, ParkingSpot } from './track.js'
import { Car, Engine } from './cars.js'
import { Consist, Train } from './consists.js'

export class RailNetwork {
  constructor() {
    this.tracks = new Map()
    this.parkingSpots = new Map()
    this.points = new Map()
    this.switches = new Map()
    this.bogies = new Map()
    this.hitches = new Map()
    this.cars = new Map()
    this.engines = new Map()
    this.trains = new Map()
    this.consists = new Map()
  }
  addTrack(track) {
    track.network = this
    this.tracks.set(track.id,track)
    track.A.network = this
    track.B.network = this
    this.points.set(track.A.id,track.A)
    this.points.set(track.B.id,track.B)
  }
  addPoint(point) {
    point.network = this
    this.points.set(point.id,point)
  }
  addBogie(bogie) {
    bogie.network = this
    this.bogies.set(bogie.id,bogie)
  }
  addCar(color,trackId,dir=1,t) {
    t ??= 0.5+dir*0.3
    const car = new Car(this,color,color,trackId,t,dir)
    car.A.network = this
    car.B.network = this
    this.cars.set(car.id,car)
    car.initialize()
    let id=color+performance.now()
    car.consist = new Consist(this,id,car,dir)
    this.consists.set(id,car.consist)
    this.bogies.set(car.A.id,car.A)
    this.bogies.set(car.B.id,car.B)
    return car
  }

  addParkingSpot(color,trackId) {
    const spot = new ParkingSpot(color,trackId)
    spot.network = this
    this.parkingSpots.set(color,spot)
  }

  addTrain(id,trackId,color,dir=1,t,engine,rearConsist=[],foreConsist=[]) {
    t ??= 0.5+dir*0.3
    engine ??= new Engine(this,id+'Engine',color,trackId,t,dir)
    this.engines.set(engine.id,engine)
    engine.initialize();
    [...rearConsist,...foreConsist].forEach(car=>{
      car.network = this
      this.cars.set(car.id,car)
    })
    const train = new Train(this,id,engine,rearConsist,foreConsist)
    train.network = this
    this.trains.set(train.id,train)
  }

  connectPoints(track1,track1end,track2,track2end) {
    let t1 = this.tracks.get(track1),
        t2 = this.tracks.get(track2),
        p = t1[track1end],
        q = t2[track2end]
    if (track1end == track2end) {
      t1[`set${track1end}`](q,-1)
      cloneConnections(q,p)
      cloneConnections(p,q)
    } else {
      t1[`set${track1end}`](q,1)
      cloneConnections(q,p)
      cloneConnections(p,q)
    }
    function cloneConnections(a,b) {
      b.connections.forEach((dir,connection)=>{
        if (connection && connection!=a) {
          a.merges.set(connection, dir)
          connection.merges.set(a,dir)
        }
      })
      b.merges.forEach((dir,merge)=>{
        if (merge && merge!=a) {
          a.connections.set(merge, dir)
          merge.connections.set(a,dir)
        }
      })
      a.connections.set(b, 1)
    }
  }

  checkNetwork() {
    let checked = []
    this.points.forEach(point=>{
      // if (point.connections.size<1) console.warn(`Point ${point.id} missing connection`)
      if (checked.includes(point)) {
        // console.warn(point, 'already checked')
      } else
      if (point.merges.size>0) {
        let points = [point,...point.merges.keys()]
        let switchId = points.map(t=>t.id).join('_')
        points.forEach(point=>point.switchId=switchId)
        this.switches.set(switchId,{points,currentIndex:0})
        checked.push(...points)
      }
    })
  }

  draw(ctx) {
    this.tracks.values().forEach(t=>t.draw(ctx))
    this.parkingSpots.values().forEach(p=>p.check(ctx))
    this.switches.values().forEach(s=>{
      let activePoint = s.points[s.currentIndex]
      let activeTrack = this.tracks.get(activePoint.trackId)
      activeTrack.draw(ctx,this)
    })
    this.engines.values().forEach(x=>x.update())
    // this.cars   .values().forEach(x=>x.update())
    this.points .values().forEach(x=>x.draw(ctx))
    this.bogies .values().forEach(x=>x.draw(ctx))
    this.cars   .values().forEach(x=>x.draw(ctx))
    this.engines.values().forEach(x=>x.draw(ctx))
    this.hitches.values().forEach(x=>x.draw(ctx))
    this.points .values().forEach(x=>x.drawStops(ctx))
    
    this.consists.values().forEach(x=>x.update(ctx))
    this.trains  .values().forEach(x=>x.update(ctx))
    this.bogies .values().forEach(x=>x.draw(ctx))

    // console.log(this.switches)
  }

}