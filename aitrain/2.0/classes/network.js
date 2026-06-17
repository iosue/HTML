import { clone } from '../helpers.js'

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

  new_connectPoints(track1,track1end,track2,track2end) {
    let p = this.points.get(`${track1}${track1end}`),
        q = this.points.get(`${track2}${track2end}`)
    if (!p) throw new Error(`Point p="${track1}${track1end}" not found`)
    if (!q) throw new Error(`Point q="${track2}${track2end}" not found`)

    if (track1end == track2end) {
      throw new Error(['merge',p.id,q.id])
    } else {
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
  }

  connectPoints(p,q) {
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
    track.A.in.delete(track)
    track.A.out.delete(track)
    track.B.in.delete(track)
    track.B.out.delete(track)
    this.tracks.delete(track.id)
  }
  deletePoint(point) {
    // if (point.in.size>0) console.warn('deleting',point.id,'which has',point.in.size,'in')
    // if (point.out.size>0)console.warn('deleting',point.id,'which has',point.out.size,'out')
    this.points.delete(point.id)
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