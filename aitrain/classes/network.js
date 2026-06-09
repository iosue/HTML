import { TrackSection, CurvedTrackSection, SwitchSection } from "./tracks.js"
import { Train } from "./trains.js"


// -----------------------------
// TRACK NETWORK
// -----------------------------
export class TrackNetwork {
  constructor() {
    this.sections = new Map() // store by id
    this.trains = []
  }

  addSection(section) {
    this.sections.set(section.id, section)
    return section
  }

  get(id) {
    return this.sections.get(id)
  }

  connectSections(prev, next) {
    const isSwitch = prev instanceof SwitchSection
    const alreadyConnected = prev.next.includes(next)

    const newStart = prev.end
    const newHeading = prev.getEndHeading()
    next.setStartAndHeading(newStart, newHeading)

    if (isSwitch && !alreadyConnected) {
      prev.next.push(next)
      prev.setRoute(prev.next.length - 1)
    } else {
      prev.next = [next]
    }

    next.isDisconnected = false
    next.isActiveBranch = true // default active
  }

  disconnectSections(prev, next) {
    const index = prev.next.indexOf(next)
    if (index !== -1) {
      prev.next.splice(index, 1)
      next.isDisconnected = true
    }
  }

  addTrain(train) {
    this.trains.push(train)
  }

  update(dt) {
    for (const train of this.trains) train.update(dt)
  }

  draw(ctx) {
    for (const section of this.sections.values()) {
      section.draw(ctx)
    }
    for (const train of this.trains) {
      train.draw(ctx)
    }
  }
}
