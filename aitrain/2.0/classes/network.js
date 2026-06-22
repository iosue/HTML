import { Point, StraightTrack, CurvedTrack } from './track.js'

export class RailNetwork {
  constructor() {
    this.tracks = new Map()
    this.points = new Map()
    this.switches = new Map()
    this.bogies = new Map()
    this.trains = new Map()
  }
  addTrack(track) {
    track.network = this
    this.tracks.set(track.id,track)
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
  addTrain(train) {
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
      if (point.connections.length<1) console.error(`Point ${point.id} missing connection`)
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
    this.switches.values().forEach(s=>{
      let activePoint = s.points[s.currentIndex]
      let activeTrack = this.tracks.get(activePoint.trackId)
      activeTrack.draw(ctx,this)
    })
    this.points.values().forEach(p=>p.draw(ctx,this))
    this.bogies.values().forEach(b=>b.update(this))
    this.trains.values().forEach(t=>t.draw(ctx))
    this.bogies.values().forEach(b=>b.draw(ctx))
  }
}