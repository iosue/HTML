export class RailNetwork {
  constructor() {
    this.tracks = new Map()
    this.points = new Map()
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
  addTrain(train) {
    train.network = this
    this.trains.set(train.id,train)
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
    this.trains.values().forEach(t=>t.draw(ctx))
  }
}