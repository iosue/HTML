import { TrackSection, CurvedTrackSection, SwitchSection } from "./tracks.js"
import { Train } from "./trains.js"

// -----------------------------
// TRACK NETWORK
// -----------------------------
export class TrackNetwork {
	constructor() {
		this.sections = new Map() // store by id
		this.trains = new Map()
	}

	addSection(section) {
		this.sections.set(section.id, section)
		return section
	}
	getTrack(id) {
		return this.sections.get(id)
	}
	
	addTrain(train) {
		this.trains.set(train.id, train)
		return train
	}
	getTrain(id) {
		return this.trains.get(id)
	}

	getPointAlongPath(section, t, offset) {
		// Move forward or backward along connected sections
		let current = section
		let remaining = offset

		while (current && Math.abs(remaining) > current.length) {
			if (remaining > 0) {
				remaining -= current.length
				current =
					current instanceof SwitchSection
						? current.getActiveNext()
						: current.next[0]
			} else {
				remaining += current.length
				current = this.findPreviousSection(current)
			}
		}

		if (!current) return section.getPointAt(t) // fallback
		const localT = Math.min(Math.max(remaining / current.length, 0), 1)
		return current.getPointAt(localT)
	}

	isSectionOccupied(section) {
		for (const train of this.trains.values()) {
			if (train.isOnSection(section)) return true
		}
		return false
	}

connectSections(prev, prevEndPoint, next, nextEndPoint) {
  // prevEndPoint and nextEndPoint are either "start" or "end"
  const isSwitch = prev instanceof SwitchSection
  const alreadyConnected = prev.next.includes(next)

  // --- Geometry propagation ---
  // Determine which end of prev is used as the connection origin
  const connectionPoint = prev[prevEndPoint]
  const connectionHeading = prev.getHeadingAtEnd(prevEndPoint)

  // Update next section geometry based on chosen endpoint
  next.setEndPointAndHeading(nextEndPoint, connectionPoint, connectionHeading)

  // --- Connection management ---
  if (!isSwitch && prev.next.length > 0 && !alreadyConnected) {
    prev.next = [] // replace old connection if not a switch
  }
  if (!isSwitch && next.prev.length > 0 && !alreadyConnected) {
    next.prev = [] // replace old connection if not a switch
  }
  if (!alreadyConnected) {
    prev.next.push(next)
    next.prev.push(next)
  }
}

newConnectSections(pID, prevEndPoint, nID, nextEndPoint) {

	const prev = this.getTrack(pID)
	const next = this.getTrack(nID)

	console.log(prev,next)

  // prevEndPoint and nextEndPoint are either "start" or "end"
  const isSwitch = prev instanceof SwitchSection
  const alreadyConnected = prev.next.includes(next)

  // Update next section geometry based on chosen endpoint
  next[`set${nextEndPoint}`](prev[prevEndPoint])

  // --- Connection management ---
  if (!isSwitch && prev.next.length > 0 && !alreadyConnected) {
		console.warn(`connection ${prev.id}.B to ${prev.next[0].id} broken.`)
    prev.next = [] // replace old connection if not a switch
  }
  if (!isSwitch && next.prev.length > 0 && !alreadyConnected) {
		console.warn(`connection ${next.id} to ${next.prev[0].id} broken.`)
    next.prev = [] // replace old connection if not a switch
  }
  if (!alreadyConnected) {
    prev.next.push(next)
    next.prev.push(next)
		console.log(`→ connection ${prev.id}.${prevEndPoint} to ${next.id}.${nextEndPoint} added.`)
  }
}

	disconnectSections(prev, next) {
		const index = prev.next.indexOf(next)
		if (index !== -1) {
			prev.next.splice(index, 1)
			next.isDisconnected = true
		}
	}

	update(dt) {
		for (const train of this.trains.values()) train.update(dt)
	}

	draw(ctx) {
		for (const section of this.sections.values()) section.draw(ctx)
		for (const train of this.trains.values()) train.draw(ctx)
	}
}
