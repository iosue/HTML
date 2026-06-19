import { clone } from '../helpers.js'
import { Point, StraightTrack, CurvedTrack } from './track.js'

export class RailNetwork {
  constructor() {
    this.tracks = new Map()
    this.points = new Map()
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
    if (!p) throw new Error(`Point p="${track1}${track1end}" not found`)
    if (!q) throw new Error(`Point q="${track2}${track2end}" not found`)

    if (track1end == "A" && track2end == "A") {
      console.warn('A-A',t1.id,t2.id)
      t1.reverseA = true
      p.out.forEach(output=>{
        output.track.setA(q,0)
        q.in.push(output)
        q.activeIn = output.track
      })
      q.id+='_'+p.id
      this.deletePoint(p)
    } else  if (track1end == "B" && track2end == "B") {
      console.warn('B-B',t1.id,t2.id)
      p.in.forEach(input=>{
        input.track.setB(q,0)
        q.out.push(input)
        q.activeOut = input.track
      })
      q.id+='_'+p.id
      this.deletePoint(p)
    } else {
      p.out.forEach(output=>{
        output.track.setA(q,0)
        q.out.push(output)
        q.activeOut = output.track
      })
      p.in.forEach(input=>{
        input.track.setB(q,0)
        q.in.push(input)
        q.activeIn = input.track
      })
      q.id+='_'+p.id
      this.deletePoint(p)
    }
  }

  old_connectPoints(p,q) {
    if (typeof p === 'string') p=this.points.get(p)??p
    if (typeof q === 'string') q=this.points.get(q)??q
    if (!this.points.has(p?.id)) throw new Error(`Point p="${p}" not found`)
    if (!this.points.has(q?.id)) throw new Error(`Point q="${q}" not found`)
    p.out.values().forEach(track=>{
      track.setA(q,0)
      q.out.add(track)
      q.activeOut = track
    })
    p.in.values().forEach(track=>{
      track.setB(q,0)
      q.in.add(track)
      q.activeIn = track
    })
    this.deletePoint(p)
  }

  reverseConnectPoints(p,q) {
    if (typeof p === 'string') p=this.points.get(p)??p
    if (typeof q === 'string') q=this.points.get(q)??q
    if (!this.points.has(p?.id)) throw new Error(`Point p="${p}" not found`)
    if (!this.points.has(q?.id)) throw new Error(`Point q="${q}" not found`)
    p.in.values().forEach(track=>{
      track.setB(q,0)
      q.out.add(track)
      q.activeOut = track
    })
    p.out.values().forEach(track=>{
      track.setA(q,0)
      q.in.add(track)
      q.activeIn = track
    })
    q.reversedPoint = true
    this.deletePoint(p)
  }

  mergePoints(p,q) {
    if (typeof p === 'string') p=this.points.get(p)??p
    if (typeof q === 'string') q=this.points.get(q)??q
    if (!this.points.has(p?.id)) throw new Error(`Point p="${p}" not found`)
    if (!this.points.has(q?.id)) throw new Error(`Point q="${q}" not found`)
    p.out.values().forEach(track=>{
      track.setA(q,1)
      q.out.add(track)
      q.activeOut = track
    })
    p.in.values().forEach(track=>{
      track.setB(q,1)
      q.in.add(track)
      q.activeIn = track
    })
    this.points.delete(p.id)
  }

  reverseMergePoints(p,q) {
    if (typeof p === 'string') p=this.points.get(p)??p
    if (typeof q === 'string') q=this.points.get(q)??q
    if (!this.points.has(p?.id)) throw new Error(`Point p="${p}" not found`)
    if (!this.points.has(q?.id)) throw new Error(`Point q="${q}" not found`)
    p.in.values().forEach(track=>{
      track.setA(q,1)
      q.out.add(track)
      q.activeOut = track
    })
    p.out.values().forEach(track=>{
      track.setB(q,1)
      q.in.add(track)
      q.activeIn = track
    })
    q.reversedPoint = true
    this.points.delete(p.id)
  }

  deleteTrack(track) {
    track.A.in .splice(track.A.in.indexOf(track),1)
    track.A.out.splice(track.A.out.indexOf(track),1)
    track.B.in .splice(track.B.in.indexOf(track),1)
    track.B.out.splice(track.B.out.indexOf(track),1)
    this.tracks.splice(this.tracks.indexOf(track),1)
  }
  deletePoint(point) {
    // if (point.in.size>0) console.warn('deleting',point.id,'which has',point.in.size,'in')
    // if (point.out.size>0)console.warn('deleting',point.id,'which has',point.out.size,'out')
    this.points.delete(point.id)
  }

  checkTracks() {
    this.tracks.forEach(track=>{
      if (!track.A instanceof Point) throw new Error(`Point ${track.id}-A not defined`)
      if (!track.B instanceof Point) throw new Error(`Point ${track.id}-B not defined`)
    })
    this.points.forEach(point=>{
      if (point.in.length<1) console.error(`Point ${point.id} missing Inputs`)
      if (point.out.length<1) console.error(`Point ${point.id} missing Outputs`)
      point.in.forEach(input=>{
        if (point.out.find(t=>t.track==input.track))
          throw new Error(`Point "${point.id}" has Track "${input.track.id}" as both In and Out`)
      })
      point.activeIn ??= point.in[0]?.track
      point.activeOut ??= point.out[0]?.track
    })
  }

  draw(ctx) {
    this.tracks.values().forEach(t=>t.draw(ctx))

    this.points.values().forEach(p=>p.redrawActiveTracks(ctx))
    this.points.values().forEach(p=>p.draw(ctx,this))

    this.bogies.values().forEach(t=>t.update())
    this.bogies.values().forEach(t=>t.draw(ctx))

    this.trains.values().forEach(t=>t.draw(ctx))
  }
}